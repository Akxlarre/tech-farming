from flask import Blueprint, request, jsonify
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime
import os

from app.queries.sensor_queries import insertar_sensor, obtener_sensor
from app.queries.sensor_parametro_queries import insertar_sensor_parametros
from app.models.tipo_sensor import TipoSensor

router = Blueprint('sensores', __name__, url_prefix='/api/sensores')

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

    parametros = data.get("parametros", [])

    if not parametros:
        return jsonify({"error": "Debes seleccionar al menos un parámetro"}), 400

    required_fields = ["invernadero_id", "nombre"]
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"error": "Faltan campos requeridos"}), 400

    try:
        # Buscar tipo de sensor según cantidad de parámetros
        if len(parametros) == 1:
            tipo_sensor = TipoSensor.query.filter_by(nombre="De un parámetro").first()
        else:
            tipo_sensor = TipoSensor.query.filter_by(nombre="Multiparámetro").first()

        if not tipo_sensor:
            return jsonify({"error": "No se encontró el tipo de sensor adecuado"}), 400
        
        data["tipo_sensor_id"] = tipo_sensor.id

        # Convertir fecha si viene como string
        if "fecha_instalacion" in data and isinstance(data["fecha_instalacion"], str):
            data["fecha_instalacion"] = datetime.strptime(data["fecha_instalacion"], "%Y-%m-%d").date()

        # Insertar el sensor
        sensor = insertar_sensor(data)

        if sensor:
            # Insertar los parámetros asociados
            insertar_sensor_parametros(sensor.id, parametros)

            return jsonify({
                "message": "Sensor creado exitosamente",
                "sensor_id": sensor.id,
                "token": sensor.token
            }), 201
        else:
            return jsonify({"error": "No se pudo crear el sensor"}), 500

    except Exception as e:
        return jsonify({"error": f"Error al crear el sensor: {str(e)}"}), 500
    
    
@router.route('/datos', methods=['POST'])
def recibir_datos_sensor():
    data = request.get_json()

    token = data.get("token")
    mediciones = data.get("mediciones")

    if not token or not mediciones:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    sensor_info = obtener_sensor(token)
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