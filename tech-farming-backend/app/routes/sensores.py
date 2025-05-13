# src/app/routers/sensores.py

from flask import Blueprint, request, jsonify
from influxdb_client import Point
from datetime import datetime
import dateutil.parser

from app import influx_client as client, influx_write_api as write_api
from app.config import Config
from app.models.sensor import Sensor as SensorModel
from app.models.tipo_sensor import TipoSensor
from app.queries.sensor_queries import insertar_sensor, obtener_sensor
from app.queries.sensor_parametro_queries import insertar_sensor_parametros

router = Blueprint('sensores', __name__, url_prefix='/api/sensores')


@router.route('/', methods=['GET'])
def listar_sensores():
    """GET /api/sensores → devuelve todos los sensores desde Supabase/PostgreSQL"""
    try:
        salida = [{
            "id":              s.id,
            "invernadero_id":  s.invernadero_id,
            "nombre":          s.nombre,
            "tipo_sensor_id":  s.tipo_sensor_id,
            "estado":          s.estado
        } for s in SensorModel.query.all()]
        return jsonify(salida), 200
    except Exception as e:
        return jsonify({"error": f"Error listando sensores: {e}"}), 500


@router.route('/', methods=['POST'])
def crear_sensor():
    """POST /api/sensores → crea un nuevo sensor"""
    data       = request.get_json() or {}
    parametros = data.get("parametros", [])
    if not parametros:
        return jsonify({"error": "Debes seleccionar al menos un parámetro"}), 400
    if not data.get("invernadero_id") or not data.get("nombre"):
        return jsonify({"error": "Faltan campos requeridos"}), 400

    try:
        nombre_tipo = "De un parámetro" if len(parametros) == 1 else "Multiparámetro"
        tipo = TipoSensor.query.filter_by(nombre=nombre_tipo).first()
        if not tipo:
            return jsonify({"error": "No se encontró el tipo de sensor adecuado"}), 400

        data["tipo_sensor_id"] = tipo.id
        if "fecha_instalacion" in data and isinstance(data["fecha_instalacion"], str):
            data["fecha_instalacion"] = datetime.strptime(data["fecha_instalacion"], "%Y-%m-%d").date()

        sensor = insertar_sensor(data)
        insertar_sensor_parametros(sensor.id, parametros)

        return jsonify({
            "message":   "Sensor creado exitosamente",
            "sensor_id": sensor.id,
            "token":     sensor.token
        }), 201

    except Exception as e:
        return jsonify({"error": f"Error al crear el sensor: {e}"}), 500


@router.route('/datos', methods=['POST'])
def recibir_datos_sensor():
    """POST /api/sensores/datos → recibe y escribe puntos en InfluxDB"""
    data       = request.get_json() or {}
    token      = data.get("token")
    mediciones = data.get("mediciones")
    if not token or not mediciones:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    sensor_info = obtener_sensor(token)
    if not sensor_info:
        return jsonify({"error": "Sensor no registrado"}), 404

    puntos = []
    for m in mediciones:
        if not m.get("parametro") or m.get("valor") is None:
            continue
        puntos.append(
            Point("lecturas_sensores")
              .tag("sensor_id", sensor_info.id)
              .field("parametro", m["parametro"])
              .field("valor", float(m["valor"]))
              .time(datetime.utcnow())
        )

    if puntos:
        write_api.write(bucket=Config.INFLUXDB_BUCKET, org=Config.INFLUXDB_ORG, record=puntos)
        return jsonify({"message": "Datos recibidos correctamente"}), 200
    else:
        return jsonify({"error": "No se procesaron datos válidos"}), 400


@router.route('/ultimas-lecturas', methods=['GET'])
def obtener_ultimas_lecturas():
    """GET /api/sensores/ultimas-lecturas?limit=N → últimas N lecturas de InfluxDB"""
    try:
        limit     = int(request.args.get("limit", 5))
        bucket    = Config.INFLUXDB_BUCKET
        query_api = client.query_api()

        flux = f'''
        from(bucket: "{bucket}")
          |> range(start: -30d)
          |> filter(fn: (r) =>
               r._measurement == "lecturas_sensores" and
               (r._field == "valor" or r._field == "parametro")
             )
          |> keep(columns: [
               "_time",
               "sensor_id",
               "invernadero_id",
               "tipo_sensor",
               "zona",
               "_field",
               "_value"
             ])
          |> pivot(
               rowKey:   ["_time","sensor_id"],
               columnKey: ["_field"],
               valueColumn: "_value"
             )
          |> sort(columns: ["_time"], desc: true)
          |> limit(n: {limit})
        '''

        tables = query_api.query(flux)
        resultados = [{
            "sensor_id":      rec.values.get("sensor_id"),
            "invernadero_id": rec.values.get("invernadero_id"),
            "tipo_sensor":    rec.values.get("tipo_sensor"),
            "zona":           rec.values.get("zona"),
            "parametro":      rec.values.get("parametro"),
            "valor":          rec.values.get("valor"),
            "timestamp":      rec.get_time().isoformat()
        } for table in tables for rec in table.records]

        return jsonify(resultados), 200

    except Exception as e:
        print("❌ Flux error:", e)
        return jsonify({"error": f"Error al consultar lecturas: {e}"}), 500


def obtener_ultimas_lecturas_flux(limit: int = 10):
    """
    Lógica Flux + pivot para devolver las últimas `limit` lecturas.
    """
    bucket = Config.INFLUXDB_BUCKET
    flux = f'''
    from(bucket: "{bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) =>
           r._measurement == "lecturas_sensores" and
           (r._field == "valor" or r._field == "parametro")
         )
      |> keep(columns: [
           "_time",
           "sensor_id",
           "invernadero_id",
           "tipo_sensor",
           "zona",
           "_field",
           "_value"
         ])
      |> pivot(
           rowKey:   ["_time","sensor_id"],
           columnKey: ["_field"],
           valueColumn: "_value"
         )
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: {limit})
    '''
    tables = client.query_api().query(flux)
    lecturas = []
    for table in tables:
        for rec in table.records:
            v = rec.values
            lecturas.append({
                "sensor_id":      v.get("sensor_id"),
                "invernadero_id": v.get("invernadero_id"),
                "tipo_sensor":    v.get("tipo_sensor"),
                "zona":           v.get("zona"),
                "parametro":      v.get("parametro"),
                "valor":          v.get("valor"),
                "timestamp":      rec.get_time().isoformat()
            })
    return lecturas


@router.route('/merged-lecturas', methods=['GET'])
def merged_lecturas():
    """
    GET /api/sensores/merged-lecturas?limit=N
    Devuelve max N lecturas fusionadas (sensor + sus lecturas),
    agrupando en listas los parámetros y valores que compartan
    exactamente el mismo timestamp.
    """
    try:
        lim = int(request.args.get("limit", 10))

        # 1) Sensores desde Supa
        supa = [{
            "id":             s.id,
            "nombre":         s.nombre,
            "tipo_sensor_id": s.tipo_sensor_id,
            "invernadero_id": s.invernadero_id,
            "estado":         s.estado,
        } for s in SensorModel.query.all()]

        # 2) Lecturas crudas de Influx
        lecturas = obtener_ultimas_lecturas_flux(lim)

        # 3) Agrupar por (sensor_id, timestamp sin micros)
        agrupadas = {}
        for l in lecturas:
            dt = dateutil.parser.isoparse(l["timestamp"])
            ts_seg = dt.replace(microsecond=0).isoformat()
            key = (l["sensor_id"], ts_seg)
            if key not in agrupadas:
                agrupadas[key] = {
                    **l,
                    "timestamp": ts_seg,
                    "parametros": [l["parametro"]],
                    "valores":     [l["valor"]]
                }
            else:
                agrupadas[key]["parametros"].append(l["parametro"])
                agrupadas[key]["valores"].append(l["valor"])

        # 4) Fusionar con datos de Supa y ordenar
        merged = []
        for (sid, ts), grp in agrupadas.items():
            num = int(str(sid).lstrip("S0"))
            sensor = next((s for s in supa if s["id"] == num), None)
            if not sensor:
                continue
            merged.append({**sensor, **grp})

        merged.sort(key=lambda x: x["timestamp"], reverse=True)
        merged = merged[:lim]

        return jsonify(merged), 200

    except Exception as e:
        return jsonify({"error": f"Error al obtener merged-lecturas: {e}"}), 500
