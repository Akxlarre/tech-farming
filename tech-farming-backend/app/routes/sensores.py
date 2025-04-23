from flask import Blueprint, request, jsonify
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime
import os

from app.models.sensor_queries import obtener_sensor_metadata, insertar_sensor

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


@router.route('/datos', methods=['POST'])
def recibir_datos_sensor():
    data = request.get_json()

    token = data.get("token")
    mediciones = data.get("mediciones")

    if not token or not mediciones:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    sensor_info = obtener_sensor_metadata(token)
    if not sensor_info:
        return jsonify({"error": "Sensor no registrado"}), 404

    puntos = []

    for m in mediciones:
        parametro = m.get("parametro")
        valor = m.get("valor")

        if not parametro or valor is None:
            continue

        punto = (
            Point("lecturas_sensores")
            .tag("token", token)
            .field("parametro", parametro)
            .field("valor", float(valor))
            .time(datetime.utcnow())
        )
        puntos.append(punto)

    if puntos:
        write_api.write(bucket=INFLUXDB_BUCKET, record=puntos)
        return jsonify({"message": "Datos recibidos correctamente"}), 200
    else:
        return jsonify({"error": "No se procesaron datos válidos"}), 400


@router.route('/', methods=['POST'])
def crear_sensor():
    data = request.get_json()

    required_fields = ["invernadero_id", "nombre", "zona", "tipo_sensor_id"]
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