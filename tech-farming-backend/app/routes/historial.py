# app/routes/historial.py

from flask import Blueprint, request, jsonify, current_app, abort
from dateutil.parser import isoparse
from influxdb_client.client.exceptions import InfluxDBError
from app.queries.historial_queries import obtener_historial as helper_historial
from app.models.tipo_parametro import TipoParametro as TipoParametroModel
from app.models.zona import Zona as ZonaModel
from app import influx_client
from app.config import Config

router = Blueprint('historial', __name__, url_prefix='/api')

@router.route('/historial', methods=['GET'])
def get_historial():
    # 1) Parámetros obligatorios
    inv_id    = request.args.get('invernaderoId',  type=int)
    desde_s   = request.args.get('desde',           type=str)
    hasta_s   = request.args.get('hasta',           type=str)
    tp_id     = request.args.get('tipoParametroId', type=int)

    if None in (inv_id, desde_s, hasta_s, tp_id):
        abort(400, description="Faltan parámetros obligatorios: invernaderoId, desde, hasta, tipoParametroId")

    # 2) Parsear y validar fechas
    try:
        dt_desde_obj = isoparse(desde_s)
        dt_hasta_obj = isoparse(hasta_s)
    except (ValueError, TypeError):
        abort(400, description="Formato de fecha inválido. Usa ISO 8601, p.ej. 2025-05-21T12:00:00Z")
    if dt_desde_obj > dt_hasta_obj:
        abort(400, description="'desde' no puede ser posterior a 'hasta'")

    # Convertimos de nuevo a ISO para pasarlo al helper
    dt_desde = dt_desde_obj.isoformat()
    dt_hasta = dt_hasta_obj.isoformat()

    # 3) Elegir window_every dinámicamente
    span_sec = (dt_hasta_obj - dt_desde_obj).total_seconds()
    if span_sec < 6 * 24 * 3600:
        window_every = None
    else:
        max_points = 200
        every_sec = max(int(span_sec / max_points), 1)

        if every_sec < 60:
            window_every = f"{every_sec}s"
        elif every_sec < 3600:
            window_every = f"{every_sec // 60}m"
        else:
            window_every = f"{every_sec // 3600}h"

    current_app.logger.debug(f"Historial rango {span_sec}s → window_every={window_every}")

    # 4) Obtener nombre de parámetro
    tp = TipoParametroModel.query.get(tp_id)
    if not tp:
        abort(400, description=f"Tipo de parámetro {tp_id} no existe")
    nombre_parametro = tp.nombre

    # 5) Parámetros opcionales
    zona_id   = request.args.get('zonaId',   type=int)
    sensor_id = request.args.get('sensorId', type=int)
    if sensor_id is not None:
        zona_id = None
    if zona_id is not None:
        zona = ZonaModel.query.get(zona_id)
        if not zona or zona.invernadero_id != inv_id:
            abort(400, description=f"La zona {zona_id} no pertenece al invernadero {inv_id}")

    # 6) Llamar al helper con manejo de errores
    try:
        result = helper_historial(
            query_api=      influx_client.query_api(),
            bucket=         Config.INFLUXDB_BUCKET,
            org=            Config.INFLUXDB_ORG,
            invernadero_id= inv_id,
            tipo_parametro= nombre_parametro,
            desde=          dt_desde,
            hasta=          dt_hasta,
            zona_id=        zona_id,
            sensor_id=      sensor_id,
            window_every=   window_every
        )
    except InfluxDBError as e:
        current_app.logger.error(f"InfluxDBError en /api/historial: {e}")
        abort(502, description="Error al consultar InfluxDB")
    except Exception:
        current_app.logger.exception("Error inesperado en /api/historial")
        abort(500, description="Error interno del servidor")

    # 7) Si no hay datos, devolvemos estructuras vacías
    if not result.get("series"):
        return jsonify({
            "series": [],
            "stats":  {"promedio": 0, "minimo": None, "maximo": None, "desviacion": 0}
        }), 200

    return jsonify(result), 200