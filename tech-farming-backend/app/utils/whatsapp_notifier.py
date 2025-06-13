import requests
import os
from twilio.rest import Client

""" account_sid = os.getenv("TWILIO_SID")
auth_token = os.getenv("TWILIO_TOKEN")
twilio_whatsapp = os.getenv("TWILIO_WHATSAPP_NUMBER") """
ULTRAMSG_INSTANCE_ID = os.getenv("ULTRAMSG_INSTANCE_ID")
ULTRAMSG_TOKEN = os.getenv("ULTRAMSG_TOKEN")
print("Instance:", ULTRAMSG_INSTANCE_ID)
print("Token:", ULTRAMSG_TOKEN)

# client = Client(account_sid, auth_token)

""" def enviar_whatsapp(mensaje: str, numero_destino: str):
    try:
        mensaje_enviado = client.messages.create(
            body=mensaje,
            from_=twilio_whatsapp,
            to=numero_destino
        )
        print(f"[WHATSAPP] Enviado a {numero_destino}")
        return True
    except Exception as e:
        print(f"[ERROR WHATSAPP] {e}")
        return False
 """

def enviar_whatsapp(mensaje: str, numero_destino: str):
    """
    Envía un mensaje de WhatsApp usando UltraMsg API.
    El número debe ir como 'whatsapp:+56912345678' o '+56912345678'.
    """
    numero = numero_destino.replace("whatsapp:", "").replace(" ", "").strip()

    url = f"https://api.ultramsg.com/{ULTRAMSG_INSTANCE_ID}/messages/chat"
    payload = {
        "token": ULTRAMSG_TOKEN,
        "to": numero,
        "body": mensaje
    }

    response = requests.post(url, data=payload)
    
    if response.status_code == 200:
        print(f"[WHATSAPP] ✅ Mensaje enviado a {numero}")
        return True
    else:
        print(f"[WHATSAPP] ❌ Error al enviar a {numero}: {response.text}")
        return False
    