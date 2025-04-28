from flask import Blueprint, request, jsonify
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime
import os

from app.queries.sensor_queries import obtener_sensor_metadata, insertar_sensor

router = Blueprint('sensores', __name__)

# Configuración de InfluxDB
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
ORG = os.getenv("INFLUXDB_ORG")

client = InfluxDBClient(
    url=INFLUXDB_URL,
    token=INFLUXDB_TOKEN,
    org=ORG
)
write_api = client.write_api(write_options=SYNCHRONOUS)


@router.route('/', methods=['POST'])
def crear_sensor():
    data = request.get_json()

    required_fields = ["invernadero_id", "nombre", "tipo_sensor_id"]
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"error": "Faltan campos requerido"}), 400

    try:
        # Convertir fecha si viene como string
        if "fecha_instalacion" in data and isinstance(data["fecha_instalacion"], str):
            data["fecha_instalacion"] = datetime.strptime(data["fecha_instalacion"], "%Y-%m-%d").date()

        sensor = insertar_sensor(data)

        if sensor:
            return jsonify({
                "message": "Sensor creado exitosamente",
                "sensor_id": sensor.id
            }), 201
        else:
            return jsonify({"error": "No se pudo crear el sensor"}), 500

    except Exception as e:
        return jsonify({"error": f"Error al crear el sensor: {str(e)}"}), 500