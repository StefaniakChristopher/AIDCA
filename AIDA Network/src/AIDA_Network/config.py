
import os

# Path to the U²-Net weights file.

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, "weights", "u2net.pth")

# Input image size for the network.
INPUT_SIZE = (320, 320)
