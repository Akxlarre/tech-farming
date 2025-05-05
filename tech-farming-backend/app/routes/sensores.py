# src/app/routers/sensores.py

from flask import Blueprint, request, jsonify
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime
import os

from app.queries.sensor_queries import insertar_sensor, obtener_sensor
from app.queries.sensor_parametro_queries import insertar_sensor_parametros
from app.models.sensor import Sensor as SensorModel
from app.models.tipo_sensor import TipoSensor

router = Blueprint('sensores', __name__, url_prefix='/api/sensores')

# Configuración de InfluxDB
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
ORG            = os.getenv("INFLUXDB_ORG")

client    = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=ORG)
write_api = client.write_api(write_options=SYNCHRONOUS)


@router.route('/', methods=['GET', 'POST'])
def sensores_root():
    if request.method == 'GET':
        # Listar todos los sensores desde Supabase (PostgreSQL vía SQLAlchemy)
        try:
            sensores = SensorModel.query.all()
            resultado = []
            for s in sensores:
                resultado.append({
                    "id":              s.id,
                    "invernadero_id":  s.invernadero_id,
                    "nombre":          s.nombre,
                    "tipo_sensor_id":  s.tipo_sensor_id,
                    "estado":          s.estado
                })
            return jsonify(resultado), 200
        except Exception as e:
            return jsonify({"error": f"Error listando sensores: {str(e)}"}), 500

    # Si es POST, creamos un nuevo sensor
    data = request.get_json()
    parametros = data.get("parametros", [])
    if not parametros:
        return jsonify({"error": "Debes seleccionar al menos un parámetro"}), 400

    required_fields = ["invernadero_id", "nombre"]
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"error": "Faltan campos requeridos"}), 400

    try:
        # Determinar tipo de sensor
        if len(parametros) == 1:
            tipo_sensor = TipoSensor.query.filter_by(nombre="De un parámetro").first()
        else:
            tipo_sensor = TipoSensor.query.filter_by(nombre="Multiparámetro").first()
        if not tipo_sensor:
            return jsonify({"error": "No se encontró el tipo de sensor adecuado"}), 400

        data["tipo_sensor_id"] = tipo_sensor.id
        # Parsear fecha si viene como string
        if "fecha_instalacion" in data and isinstance(data["fecha_instalacion"], str):
            data["fecha_instalacion"] = datetime.strptime(data["fecha_instalacion"], "%Y-%m-%d").date()

        sensor = insertar_sensor(data)
        if not sensor:
            return jsonify({"error": "No se pudo crear el sensor"}), 500

        insertar_sensor_parametros(sensor.id, parametros)
        return jsonify({
            "message":   "Sensor creado exitosamente",
            "sensor_id": sensor.id,
            "token":     sensor.token
        }), 201

    except Exception as e:
        return jsonify({"error": f"Error al crear el sensor: {str(e)}"}), 500


@router.route('/datos', methods=['POST'])
def recibir_datos_sensor():
    data        = request.get_json()
    token       = data.get("token")
    mediciones  = data.get("mediciones")
    if not token or not mediciones:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    sensor_info = obtener_sensor(token)
    if not sensor_info:
        return jsonify({"error": "Sensor no registrado"}), 404

    puntos = []
    for m in mediciones:
        parametro = m.get("parametro")
        valor     = m.get("valor")
        unidad    = m.get("unidad", "")
        if not parametro or valor is None:
            continue

        punto = (
            Point("lecturas_sensores")
            .tag("token", token)
            .tag("sensor_id", sensor_info.id)
            .field("parametro", parametro)
            .field("valor", float(valor))
            .field("unidad", unidad)
            .tag("invernadero_id", str(sensor_info.invernadero_id))
            .tag("tipo_sensor", sensor_info.tipo_sensor.nombre if sensor_info.tipo_sensor else "")
            .tag("zona", getattr(sensor_info, 'zona', ""))
            .time(datetime.utcnow())
        )
        puntos.append(punto)

    if not puntos:
        return jsonify({"error": "No se procesaron datos válidos"}), 400

    write_api.write(bucket=INFLUXDB_BUCKET, record=puntos)
    return jsonify({"message": "Datos recibidos correctamente"}), 200


@router.route('/ultimas-lecturas', methods=['GET'])
def obtener_ultimas_lecturas():
    try:
        query_api = client.query_api()
        query = f'''
        from(bucket: "{INFLUXDB_BUCKET}")
          |> range(start: -30d)
          |> filter(fn: (r) => r._measurement == "lecturas_sensores")
          |> filter(fn: (r) => r._field == "valor" or r._field == "parametro")
          |> pivot(
               rowKey:   ["sensor_id", "_time"],
               columnKey:["_field"],
               valueColumn: "_value"
             )
          |> group(columns: ["sensor_id"])
          |> last(column: "_time")
        '''
        tables = query_api.query(query)

        resultados = []
        for table in tables:
            for record in table.records:
                vals = record.values
                resultados.append({
                    "sensor_id":      vals.get("sensor_id"),
                    "parametro":      vals.get("parametro"),
                    "valor":          vals.get("valor"),
                    "timestamp":      record.get_time().isoformat(),
                    "tipo_sensor":    vals.get("tipo_sensor"),
                    "zona":           vals.get("zona"),
                    "invernadero_id": vals.get("invernadero_id"),
                })

        return jsonify(resultados), 200

    except Exception as e:
        return jsonify({"error": f"Error al consultar lecturas: {str(e)}"}), 500
