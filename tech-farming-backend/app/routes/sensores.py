# src/app/routers/sensores.py

from flask import Blueprint, request, jsonify
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime

from app.config import Config
from app.models.sensor import Sensor as SensorModel
from app.models.tipo_sensor import TipoSensor
from app.queries.sensor_queries import insertar_sensor, obtener_sensor
from app.queries.sensor_parametro_queries import insertar_sensor_parametros

router = Blueprint('sensores', __name__, url_prefix='/api/sensores')

# Inicializa InfluxDB
client    = InfluxDBClient(
    url=Config.INFLUXDB_URL,
    token=Config.INFLUXDB_TOKEN,
    org=Config.INFLUXDB_ORG
)
write_api = client.write_api(write_options=SYNCHRONOUS)


@router.route('/', methods=['GET'])
def listar_sensores():
    """GET /api/sensores → devuelve todos los sensores desde Supabase/PostgreSQL"""
    try:
        sensores = SensorModel.query.all()
        salida = []
        for s in sensores:
            salida.append({
                "id":              s.id,
                "invernadero_id":  s.invernadero_id,
                "nombre":          s.nombre,
                "tipo_sensor_id":  s.tipo_sensor_id,
                "estado":          s.estado
            })
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
        # Selección automática de tipo de sensor
        nombre_tipo = "De un parámetro" if len(parametros) == 1 else "Multiparámetro"
        tipo = TipoSensor.query.filter_by(nombre=nombre_tipo).first()
        if not tipo:
            return jsonify({"error": "No se encontró el tipo de sensor adecuado"}), 400

        data["tipo_sensor_id"] = tipo.id
        # Parsear fecha si viene como string
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
        punto = (
            Point("lecturas_sensores")
            .tag("sensor_id", sensor_info.id)
            .field("parametro", m["parametro"])
            .field("valor", float(m["valor"]))
            .time(datetime.utcnow())
        )
        puntos.append(punto)

    if puntos:
        write_api.write(bucket=Config.INFLUXDB_BUCKET, record=puntos)
        return jsonify({"message": "Datos recibidos correctamente"}), 200
    else:
        return jsonify({"error": "No se procesaron datos válidos"}), 400


# src/app/routers/sensores.py  (solo la parte de /ultimas-lecturas)

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
          // conservamos tags y los dos campos/raw para pivot
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
        resultados = []
        for table in tables:
            for rec in table.records:
                v = rec.values
                resultados.append({
                    "sensor_id":      v.get("sensor_id"),
                    "invernadero_id": v.get("invernadero_id"),
                    "tipo_sensor":    v.get("tipo_sensor"),
                    "zona":           v.get("zona"),
                    "parametro":      v.get("parametro"),
                    "valor":          v.get("valor"),
                    "timestamp":      rec.get_time().isoformat()
                })

        return jsonify(resultados), 200
        
    except Exception as e:
        # para depurar, imprimimos el error completo en consola
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
#MERGED ES SOLO PARA PRUEBAS
@router.route('/merged-lecturas', methods=['GET'])
def merged_lecturas():
    """
    GET /api/sensores/merged-lecturas?limit=N
    Devuelve max N lecturas fusionadas (sensor + su última lectura).
    Útil para debug.
    """
    try:
        lim = int(request.args.get("limit", 10))

        # 1) Sensores desde Supabase (PostgreSQL via SQLAlchemy)
        supa = [
            {
              "id":             s.id,
              "nombre":         s.nombre,
              "tipo_sensor_id": s.tipo_sensor_id,
              "invernadero_id": s.invernadero_id,
              "estado":         s.estado,
            }
            for s in SensorModel.query.all()
        ]

        # 2) Lecturas desde Influx
        lecturas = obtener_ultimas_lecturas_flux(lim)

        # 3) Fusionar en memoria
        merged = []
        for l in lecturas:
            # convierto “S00x” → x
            sid = int(l["sensor_id"].lstrip("S00"))
            s = next((x for x in supa if x["id"] == sid), None)
            if s:
                merged.append({**s, **l})

        # 4) APLICAR LIMIT final
        merged = merged[:lim]

        return jsonify(merged), 200

    except Exception as e:
        return jsonify({"error": f"Error al obtener merged-lecturas: {e}"}), 500

    
    