from app import db
from app.models.tipo_sensor import TipoSensor

def obtener_tipos_sensor():
    try:
        return TipoSensor.query.all()
    except Exception as e:
        print(f"Error al obtener tipos de sensor: {e}")
        return []
