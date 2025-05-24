from app import db
from app.models.sensor import Sensor
from datetime import date
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
            pos_x=data.get("pos_x"),
            pos_y=data.get("pos_y"),
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
    