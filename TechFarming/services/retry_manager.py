import os
import json
import time
from services.http_client import enviar_datos

BUFFER_FILE = "data/buffer_pendientes.json"

def guardar_en_buffer(payload):
    os.makedirs("data", exist_ok=True)
    buffer = []

    if os.path.exists(BUFFER_FILE):
        with open(BUFFER_FILE, "r") as f:
            try:
                buffer = json.load(f)
            except:
                buffer = []

    buffer.append(payload)
    with open(BUFFER_FILE, "w") as f:
        json.dump(buffer, f, indent=2)
    print("📝 Datos almacenados en buffer local.")

def reintentar_envio():
    if not os.path.exists(BUFFER_FILE):
        return

    try:
        with open(BUFFER_FILE, "r") as f:
            buffer = json.load(f)
    except Exception:
        print("⚠️ No se pudo leer el buffer.")
        return

    if not buffer:
        return

    nuevos_fallos = []
    for payload in buffer:
        exito = enviar_datos(payload)
        if not exito:
            nuevos_fallos.append(payload)

    if nuevos_fallos:
        with open(BUFFER_FILE, "w") as f:
            json.dump(nuevos_fallos, f, indent=2)
        print(f"🔁 Algunos datos no se pudieron reenviar ({len(nuevos_fallos)}).")
    else:
        os.remove(BUFFER_FILE)
        print("✅ Buffer reenviado exitosamente y limpiado.")
