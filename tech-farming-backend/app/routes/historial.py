# app/routers/historial.py

from flask import Blueprint, request, jsonify
from dateutil.parser import isoparse

router = Blueprint('historial', __name__)

@router.route('/historial', methods=['GET'])
def get_historial():
    """
    GET /api/historial?
       invernaderoId=<int>&
       desde=<ISO8601>&
       hasta=<ISO8601>&
       tipoParametroId=<int>&
       [zonaId=<int>&]
       [sensorId=<int>]
    """
    try:
        # 1) Parámetros obligatorios
        inv_id  = request.args.get('invernaderoId', type=int)
        desde   = request.args.get('desde')
        hasta   = request.args.get('hasta')
        tp_id   = request.args.get('tipoParametroId', type=int)

        if not all([inv_id, desde, hasta, tp_id]):
            raise ValueError("Faltan uno o más parámetros obligatorios")

        # Convertir fechas a datetime
        dt_desde = isoparse(desde)
        dt_hasta = isoparse(hasta)

        # 2) Parámetros opcionales
        zona_id   = request.args.get('zonaId',   type=int)
        sensor_id = request.args.get('sensorId', type=int)

        # (por ahora sólo devolvemos parámetros en JSON de prueba)
        return jsonify({
            "invernaderoId":  inv_id,
            "desde":          dt_desde.isoformat(),
            "hasta":          dt_hasta.isoformat(),
            "tipoParametroId": tp_id,
            "zonaId":         zona_id,
            "sensorId":       sensor_id,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400
