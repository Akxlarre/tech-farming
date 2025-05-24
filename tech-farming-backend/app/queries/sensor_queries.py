from app import db
from app.models.sensor import Sensor
from datetime import date
from app.models.sensor import Sensor as SensorModel
from app.models.sensor_parametro import SensorParametro
import secrets

def obtener_sensor(token):
    return Sensor.query.filter_by(token=token).first()

def insertar_sensor(data):
    try:
        nuevo_sensor = Sensor(
            invernadero_id=data["invernadero_id"],
            nombre=data.get("nombre"),
            descripcion=data.get("descripcion"),
            estado=data.get("estado"),
            fecha_instalacion=data.get("fecha_instalacion", date.today()),
            tipo_sensor_id=data["tipo_sensor_id"],
            token=secrets.token_hex(16)
        )

        db.session.add(nuevo_sensor)
        db.session.commit()

        return nuevo_sensor
    except Exception as e:
        db.session.rollback()
        print(f"Error al insertar sensor: {e}")
        return None
    
def obtener_sensores_por_zona(zona_id: int) -> list[dict]:
    """
    Devuelve una lista de sensores para una zona dada,
    cada uno con id, nombre y demás campos mínimos.
    """
    sensores = (
        Sensor.query
        .filter_by(zona_id=zona_id)
        .order_by(Sensor.nombre)
        .all()
    )
    salida = []
    for s in sensores:
        salida.append({
            "id":               s.id,
            "nombre":           s.nombre,
            "descripcion":      s.descripcion,
            "estado":           s.estado,
            "tipo_sensor_id":   s.tipo_sensor_id,
            "token":            s.token
        })
    return salida    
    

def obtener_sensores_por_invernadero_y_parametro(invernadero_id: int, tipo_parametro_id: int) -> list[dict]:
    """
    Devuelve una lista de sensores instalados en un invernadero
    que tienen asociado un tipo de parámetro específico.
    """
    sensores = (
        SensorModel.query
        .join(SensorParametro, SensorParametro.sensor_id == SensorModel.id)
        .filter(
            SensorModel.zona.has(invernadero_id=invernadero_id),
            SensorParametro.tipo_parametro_id == tipo_parametro_id
        )
        .order_by(SensorModel.nombre)
        .all()
    )

    return [{"id": s.id, "nombre": s.nombre} for s in sensores]