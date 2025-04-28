from app import db
from app.models.tipo_parametro import TipoParametro

def obtener_tipos_parametro():
    try:
        tipos = TipoParametro.query.all()
        return [{"id": t.id, "nombre": t.nombre, "unidad": t.unidad} for t in tipos]
    except Exception as e:
        print(f"Error al obtener tipos de parámetro: {e}")
        return []
