from app import db
from app.models.invernadero import Invernadero

def obtener_invernaderos():
    try:
        return Invernadero.query.all()
    except Exception as e:
        print(f"Error al obtener invernaderos: {e}")
        return []
