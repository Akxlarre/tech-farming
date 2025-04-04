from app import db
from app.models.sensor import Sensor  # Asegúrate de importar el modelo correctamente

def obtener_sensor_metadata(sensor_id):
    sensor = Sensor.query.get(sensor_id)
    return sensor