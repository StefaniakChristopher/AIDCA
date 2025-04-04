# segmenter.py
import cv2
import torch
import numpy as np
from .u2net import U2NET
from .utils import run_u2net, approximate_polygon, four_point_transform
from .config import DEFAULT_MODEL_PATH
import os

class U2NetSegmenter:
    def __init__(self, model_path=None, device="cpu"):
        """
        Initialize the U²-Net model and load weights.
        
        Parameters:
            model_path (str): Path to the weights file.
            device (str): Device to run the model on.
        """
        self.device = device
        self.model = U2NET(3, 1)
        
        # Use the provided model_path if available; otherwise, calculate a default path.
        if model_path is not None:
            weights_path = model_path
        else:
            # Dynamically get the project root path from the source tree.
            project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            weights_path = os.path.join(project_root, "weights", "u2net.pth")

        if not os.path.exists(weights_path):
            raise FileNotFoundError(f"Weight file not found: {weights_path}")

        self.model.load_state_dict(torch.load(weights_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()

    def process_image(self, image_bgr):
        """
        Process an input image (in BGR format) and return the segmented image.
        
        The processing pipeline:
          1. Run the first pass of U²-Net to generate a saliency mask.
          2. Threshold the mask and detect contours.
          3. If a quadrilateral is detected, perform a perspective warp;
             otherwise, fall back to a simple bounding box crop.
        
        Parameters:
            image_bgr (np.ndarray): Input image in BGR format.
        
        Returns:
            result (np.ndarray): The final processed image.
        """
        # Run U²-Net to get the saliency mask.
        mask = run_u2net(self.model, image_bgr)
        
        # Threshold the saliency mask to create a binary mask.
        _, binary_mask = cv2.threshold(mask, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Find contours from the binary mask.
        contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            raise ValueError("No contours found in the image.")
        
        # Select the largest contour.
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Try to approximate the contour as a quadrilateral.
        approx = approximate_polygon(largest_contour, epsilon_factor=0.02)
        
        if len(approx) == 4:
            # If a quadrilateral is detected, perform a perspective transform.
            result = four_point_transform(image_bgr, approx)
        else:
            # Otherwise, use a simple bounding box crop.
            x, y, w, h = cv2.boundingRect(largest_contour)
            result = image_bgr[y:y+h, x:x+w]
        
        return result
