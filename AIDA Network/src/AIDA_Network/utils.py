# utils.py
import cv2
import numpy as np
import torch
from torchvision import transforms
from .config import INPUT_SIZE

def preprocess(image):
    """
    Convert BGR to RGB, resize to INPUT_SIZE, normalize, and add batch dimension.
    """
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image_resized = cv2.resize(image_rgb, INPUT_SIZE)
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    input_tensor = transform(image_resized).unsqueeze(0)
    return input_tensor

def run_u2net(model, image_bgr):
    """
    Runs the first pass of U²-Net on a BGR image and returns a saliency mask
    (as a NumPy array with values 0-255 and same spatial dimensions as the input).
    """
    orig_h, orig_w = image_bgr.shape[:2]
    input_tensor = preprocess(image_bgr)
    with torch.no_grad():
        d1, d2, d3, d4, d5, d6, d7 = model(input_tensor)
        # Use the first output (d1) for segmentation.
        pred = d1[:, 0, :, :]
        pred = pred.squeeze().cpu().numpy()

    # Normalize predictions to 0-255.
    pred_norm = (pred - pred.min()) / (pred.max() - pred.min() + 1e-8)
    mask = (pred_norm * 255).astype(np.uint8)

    # Resize mask back to original dimensions.
    mask_resized = cv2.resize(mask, (orig_w, orig_h))
    return mask_resized

def approximate_polygon(contour, epsilon_factor=0.02):
    """
    Approximate a polygon from the contour based on epsilon_factor.
    Returns the approximated polygon points.
    """
    peri = cv2.arcLength(contour, True)
    epsilon = epsilon_factor * peri
    approx = cv2.approxPolyDP(contour, epsilon, True)
    return approx

def reorder_corners(corners):
    """
    Given 4 corner points, reorder them as:
    [top-left, top-right, bottom-right, bottom-left].
    """
    corners = corners.reshape(4, 2)
    rect = np.zeros((4, 2), dtype="float32")
    s = corners.sum(axis=1)
    rect[0] = corners[np.argmin(s)]  # top-left
    rect[2] = corners[np.argmax(s)]  # bottom-right
    diff = np.diff(corners, axis=1)
    rect[1] = corners[np.argmin(diff)]  # top-right
    rect[3] = corners[np.argmax(diff)]  # bottom-left
    return rect

def four_point_transform(image, pts):
    """
    Performs a perspective transform of the region defined by the four points `pts`.
    Returns the warped image.
    """
    rect = reorder_corners(pts)
    (tl, tr, br, bl) = rect
    widthA = np.linalg.norm(br - bl)
    widthB = np.linalg.norm(tr - tl)
    maxWidth = int(max(widthA, widthB))
    heightA = np.linalg.norm(tr - br)
    heightB = np.linalg.norm(tl - bl)
    maxHeight = int(max(heightA, heightB))
    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]
    ], dtype="float32")
    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
    return warped
