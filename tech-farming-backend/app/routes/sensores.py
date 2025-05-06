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
from app.config import Config

router = Blueprint('sensores', __name__, url_prefix='/api/sensores')

# Configuración de InfluxDB
client    = InfluxDBClient(url=Config.INFLUXDB_URL, token=Config.INFLUXDB_TOKEN, org=Config.INFLUXDB_ORG)
write_api = client.write_api(write_options=SYNCHRONOUS)


def obtener_ultimas_lecturas_flux(limit: int = 10):
    """
    Ejecuta el Flux que pivotea valor+parametro
    y devuelve las últimas `limit` lecturas ordenadas.
    """
    bucket = Config.INFLUXDB_BUCKET
    flux = f'''
    from(bucket: "{bucket}")
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
    tables = client.query_api().query(flux)

    lecturas = []
    for table in tables:
        for record in table.records:
            v = record.values
            lecturas.append({
                "sensor_id":      v.get("sensor_id"),
                "parametro":      v.get("parametro"),
                "valor":          v.get("valor"),
                "timestamp":      record.get_time().isoformat(),
                "tipo_sensor":    v.get("tipo_sensor"),
                "zona":           v.get("zona"),
                "invernadero_id": v.get("invernadero_id"),
            })

    # ordenar descendente y truncar
    lecturas.sort(key=lambda x: x["timestamp"], reverse=True)
    return lecturas[:limit]


@router.route('/ultimas-lecturas', methods=['GET'])
def ultimas_lecturas():
    try:
        lim = int(request.args.get("limit", 10))
        datos = obtener_ultimas_lecturas_flux(lim)
        return jsonify(datos), 200
    except Exception as e:
        return jsonify({"error": f"Error al consultar lecturas: {e}"}), 500


@router.route('/merged-lecturas', methods=['GET'])
def merged_lecturas():
    """
    Devuelve la lista fusionada de sensores + sus últimas lecturas.
    Útil para debug.
    """
    try:
        lim = int(request.args.get("limit", 10))

        # 1) sensores desde Supabase (PostgreSQL via SQLAlchemy)
        supa = []
        for s in SensorModel.query.all():
            supa.append({
                "id":               s.id,
                "nombre":           s.nombre,
                "tipo_sensor_id":   s.tipo_sensor_id,
                "invernadero_id":   s.invernadero_id,
                "estado":           s.estado,
            })

        # 2) lecturas desde Influx
        lecturas = obtener_ultimas_lecturas_flux(lim)

        # 3) fusionar en memoria
        merged = []
        for l in lecturas:
            # parsea “S00x” → x
            sid = int(l["sensor_id"].lstrip("S00"))
            match = next((s for s in supa if s["id"] == sid), None)
            if match:
                # combinamos dicts
                merged.append({**match, **l})

        return jsonify(merged), 200

    except Exception as e:
        return jsonify({"error": f"Error al obtener merged-lecturas: {e}"}), 500
