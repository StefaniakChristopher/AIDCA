import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
from torchvision.models import resnet50, ResNet50_Weights
import cv2
from PIL import Image
import os
import numpy as np

# Additional imports for GradCAM visualization
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image, deprocess_image, preprocess_image
from pytorch_grad_cam.guided_backprop import GuidedBackpropReLUModel


class CustomResNet50(nn.Module):
    """Custom ResNet50 model with extra convolutional layers."""

    def __init__(self, extra_conv_layers=5):
        super(CustomResNet50, self).__init__()
        base_model = resnet50(weights=ResNet50_Weights.DEFAULT)
        self.base = nn.Sequential(*list(base_model.children())[:-2])

        conv_layers = []
        for i in range(extra_conv_layers):
            in_channels = 2048 if i == 0 else 128
            conv_layers.append(nn.Conv2d(in_channels, 128, kernel_size=3, padding=1))
            conv_layers.append(nn.ReLU(inplace=True))
            conv_layers.append(nn.BatchNorm2d(128))
        self.extra_convs = nn.Sequential(*conv_layers)

        self.global_avg_pool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc1 = nn.Linear(128, 128)
        self.fc2 = nn.Linear(128, 1)

    def forward(self, x):
        x = self.base(x)
        x = self.extra_convs(x)
        x = self.global_avg_pool(x)
        x = x.view(x.size(0), -1)
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x


class AIDetector:
    """AI Detector using CustomResNet50 for probability prediction and GradCAM visualization."""

    def __init__(self, model_path=None, device=None):
        self.device = device if device is not None else torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )
        print("Using device:", self.device)

        if model_path is None:
            project_root = os.path.abspath(
                os.path.join(os.path.dirname(__file__), "..", "..")
            )
            model_path = os.path.join(project_root, "weights", "AIArtDetection.pth")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Error: Model weights not found at {model_path}")

        self.model = CustomResNet50(extra_conv_layers=5).to(self.device)
        try:
            self.model.load_state_dict(
                torch.load(model_path, map_location=self.device)
            )
            self.model.eval()
            print(f"Model loaded successfully from {model_path}")
        except Exception as e:
            print("Error loading model:", e)
            self.model = None

        self.transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def predict(self, image, return_heatmap=False, image_name=""):
        """
        Predict the probability of the given image and optionally generate GradCAM visualization.

        Args:
            image (np.array): Input image in BGR or RGB format.
            return_heatmap (bool): If True, call gradcam_heatmap to generate heatmap outputs.

        Returns:
            float: Probability prediction if return_heatmap is False.
            tuple: (probability, status_code) if return_heatmap is True. Status code is 200 on success,
                   or 500 if an error occurred during GradCAM generation.
        """
        if self.model is None:
            print("Model not loaded. Prediction aborted.")
            return None

        if image is None:
            print("Invalid image input: None")
            return None

        # Convert BGR to RGB if needed
        if len(image.shape) == 3 and image.shape[2] == 3:
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            image_rgb = image

        input_tensor = self.transform(image_rgb).unsqueeze(0).to(self.device)
        with torch.no_grad():
            output = self.model(input_tensor)
        probability = torch.sigmoid(output).item()

        if return_heatmap:
            try:
                status = gradcam_heatmap(
                    image=image,  # accepts numpy array or file path
                    image_name=image_name,
                    model=self.model,
                    target_layer=self.model.extra_convs[-1],
                    target_class=None,
                    device=self.device
                )
            except Exception as e:
                print("Error in predict while generating heatmap:", e)
                status = 500
            return probability, status

        return probability



#######################################
#           GRADCAM VISUALIZATION     #
#######################################

def gradcam_heatmap(image, image_name, model, target_layer, target_class=None, device='cpu'):
    """
    Generate GradCAM visualizations for the given image and model.
    Accepts either a file path (string) or a NumPy array as the image input.

    Args:
        image (str or np.array): Path to the input image or the image as a numpy array.
        output_name (str): Base name for saving the outputs.
        model (torch.nn.Module): Model to use for GradCAM.
        target_layer (torch.nn.Module): Target layer for GradCAM.
        target_class (int, optional): Target class index. Defaults to None.
        device (str): Device to run the computations on.

    Returns:
        int: Status code (200 if successful, 500 if an error occurred).
    """
    try:
        # If image is a file path, read it.
        if isinstance(image, str):
            img = cv2.imread(image, 1)
            if img is None:
                print("Error: Could not read image from path.")
                return 500
            image_np = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        else:
            image_np = image

        # Convert image to float32 and normalize to [0, 1]
        image_np = image_np.astype(np.float32) / 255.0

        input_tensor = preprocess_image(
            image_np,
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ).to(device).float()  # ensure float32

        # Generate GradCAM heatmap using pytorch_grad_cam
        with GradCAM(model=model, target_layers=[target_layer]) as cam:
            cam.batch_size = 32
            grayscale_cam = cam(
                input_tensor=input_tensor,
                targets=target_class,
                aug_smooth=True,
                eigen_smooth=True
            )
            grayscale_cam = grayscale_cam[0, :]
            cam_image = show_cam_on_image(image_np, grayscale_cam, use_rgb=True)
            cam_image = cv2.cvtColor(cam_image, cv2.COLOR_RGB2BGR)

            # Guided Backpropagation
            gb_model = GuidedBackpropReLUModel(model=model, device=device)
            gb = gb_model(input_tensor, target_category=target_class)
            gb = deprocess_image(gb)

            # Save outputs
            output_dir = os.path.join(
                os.path.abspath(os.path.curdir),
                'examples/demo_images/heatmaps'
            )
            os.makedirs(output_dir, exist_ok=True)

            cam_output_path = os.path.join(output_dir, f'{image_name}_heatmap.jpg')


            cv2.imwrite(cam_output_path, cam_image)

        return 200
    except Exception as e:
        print("Error in gradcam_heatmap:", e)
        return 500


# Example usage
if __name__ == "__main__":
    detector = AIDetector()
    image_path = "path/to/image.jpg"
    image = cv2.imread(image_path)

    # Predict probability only
    prob = detector.predict(image, image_path)
    print(f"Probability: {prob}")

    # Predict probability and generate GradCAM visualization
    prob, status = detector.predict(image, return_heatmap=True)
    print(f"Probability: {prob}, GradCAM status: {status}")

    # Alternatively, directly call gradcam_heatmap using a file path:
    status2 = gradcam_heatmap(
        image=image_path,
        image_name="result_direct",
        model=detector.model,
        target_layer=detector.model.extra_convs[-1],
        target_class=None,
        device=detector.device
    )
    print(f"Direct GradCAM call status: {status2}")
