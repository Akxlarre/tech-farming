from flask import Blueprint, jsonify
from app.models.tipo_sensor_queries import obtener_tipos_sensor

router_tipo_sensor = Blueprint('tipo_sensor', __name__)

@router_tipo_sensor.route('/', methods=['GET'])
def listar_tipos_sensor():
    try:
        tipos = obtener_tipos_sensor()
        return jsonify(tipos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
