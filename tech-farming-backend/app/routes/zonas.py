from flask import Blueprint, request, jsonify
from app.models.zona_queries import obtener_zonas_por_invernadero

router_zonas = Blueprint('zonas', __name__)

@router_zonas.route('/', methods=['GET'])
def listar_zonas():
    invernadero_id = request.args.get('invernadero_id', type=int)
    if invernadero_id is None:
        return jsonify({"error": "invernadero_id es requerido"}), 400

    try:
        zonas = obtener_zonas_por_invernadero(invernadero_id)
        return jsonify(zonas), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
