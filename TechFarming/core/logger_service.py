import logging
import os

LOG_FILE = "logs/techfarming.log"

def configurar_logger(nombre="TechFarming"):
    os.makedirs("logs", exist_ok=True)
    logger = logging.getLogger(nombre)
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        handler = logging.FileHandler(LOG_FILE)
        formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
