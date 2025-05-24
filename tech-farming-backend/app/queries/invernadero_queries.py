from app import db
from app.models.invernadero import Invernadero

def obtener_invernaderos():
    try:
        invernaderos = Invernadero.query.all()
        return [
            {
                "id": inv.id,
                "nombre": inv.nombre,
                "descripcion": inv.descripcion,
                "creado_en": inv.creado_en.isoformat() if inv.creado_en else None
            }
            for inv in invernaderos
        ]
    except Exception as e:
        print(f"Error al obtener invernaderos: {e}")
        return []
