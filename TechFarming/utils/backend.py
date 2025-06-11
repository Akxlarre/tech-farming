import json
import os

CONFIG_PATH = "config/backend.json"

def get_backend_base_url():
    if not os.path.exists(CONFIG_PATH):
        raise FileNotFoundError(f"No se encontró el archivo: {CONFIG_PATH}")
    with open(CONFIG_PATH, "r") as f:
        config = json.load(f)
        return config.get("backend_base_url", "").rstrip("/")
