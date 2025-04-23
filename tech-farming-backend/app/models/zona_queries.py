from app import db
from app.models.zona import Zona

def obtener_zonas():
    try:
        return Zona.query.all()
    except Exception as e:
        print(f"Error al obtener zonas: {e}")
        return []

def obtener_zonas_por_invernadero(invernadero_id):
    try:
        return Zona.query.filter_by(invernadero_id=invernadero_id).all()
    except Exception as e:
        print(f"Error al obtener zonas por invernadero: {e}")
        return []
