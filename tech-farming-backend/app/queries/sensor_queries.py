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