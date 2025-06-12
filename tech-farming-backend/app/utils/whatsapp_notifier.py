from twilio.rest import Client
import os

account_sid = os.getenv("TWILIO_SID")
auth_token = os.getenv("TWILIO_TOKEN")
twilio_whatsapp = os.getenv("TWILIO_WHATSAPP_NUMBER")

client = Client(account_sid, auth_token)

def enviar_whatsapp(mensaje: str, numero_destino: str):
    """
    Envía un mensaje de WhatsApp usando Twilio Sandbox.
    El número destino debe ser del tipo: 'whatsapp:+56912345678'
    """
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
