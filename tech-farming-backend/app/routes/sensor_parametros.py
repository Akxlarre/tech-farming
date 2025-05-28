from flask import Blueprint, jsonify
from app.models.sensor_parametro import SensorParametro
from app.models.tipo_parametro import TipoParametro
from app.queries.sensor_parametro_queries import obtener_sensores_con_tipos_por_zona

router = Blueprint('sensor_parametros', __name__, url_prefix='/api')

@router.route('/zonas/<int:zona_id>/sensores', methods=['GET'])
def sensores_por_zona(zona_id):
    """
    GET /api/zonas/{zona_id}/sensores
    Devuelve sensores de la zona y sus tipos agregados:
      [ { id, nombre, tipos: [<param1>,…] }, … ]
    """
    try:
        data = obtener_sensores_con_tipos_por_zona(zona_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@router.route('/sensores/<int:sensor_id>/parametros', methods=['GET'])
def parametros_de_sensor(sensor_id):
    """
    GET /api/sensores/{sensor_id}/parametros
    Devuelve lista de parámetros ligados a ese sensor:
      [ { id, nombre }, … ]
    """
    try:
        filas = SensorParametro.query.filter_by(sensor_id=sensor_id).all()
        resultado = []
        for sp in filas:
            tp = TipoParametro.query.get(sp.tipo_parametro_id)
            if tp:
                resultado.append({"id": tp.id,
                                  "nombre": tp.nombre,
                                  "unidad": tp.unidad,
                                  "sensor_parametro_id": sp.id})
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
