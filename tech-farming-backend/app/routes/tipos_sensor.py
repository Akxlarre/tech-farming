from flask import Blueprint, jsonify
from app.queries.tipos_sensor_queries import obtener_tipos_sensor

router = Blueprint('tipos_sensor', __name__, url_prefix='/api/tipos-sensor')

@router.route('/', methods=['GET'])
def listar_tipos_sensor():
    try:
        tipos = obtener_tipos_sensor()
        # Serializar sólo id y nombre
        resultado = [{"id": t.id, "nombre": t.nombre} for t in tipos]
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": f"Error listando tipos de sensor: {str(e)}"}), 500
