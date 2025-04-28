from flask import Blueprint, request, jsonify
from app.queries.tipos_parametro_queries import obtener_tipos_parametro

router = Blueprint('tipos_parametro', __name__)

@router.route('/', methods=['GET'])
def listar_tipos_parametro():
    try:
        tipos_parametro = obtener_tipos_parametro()
        return jsonify(tipos_parametro), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
