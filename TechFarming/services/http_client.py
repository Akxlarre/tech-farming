import requests
from utils.backend import get_backend_base_url

API_URL = f"{get_backend_base_url()}/api/sensores/datos"

def enviar_datos(payload):
    """
    Envía datos formateados al backend vía POST.
    payload debe tener el formato:
    {
        "token": "abc123",
        "mediciones": [
            {"parametro": "temperatura", "valor": 23.5, "timestamp": 1720000000.00},
            ...
        ]
    }
    """
    try:
        headers = {"Content-Type": "application/json"}
        response = requests.post(API_URL, json=payload, headers=headers, timeout=5)
        if response.status_code == 200:
            print("✅ Datos enviados correctamente.")
            return True
        else:
            print(f"❌ Error al enviar datos ({response.status_code}): {response.text}")
            return False
    except Exception as e:
        print(f"❌ Excepción en el envío: {e}")
        return False
