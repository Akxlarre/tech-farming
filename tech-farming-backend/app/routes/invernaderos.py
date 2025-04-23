from flask import Blueprint, request, jsonify
from app.models.invernadero_queries import obtener_invernaderos

router = Blueprint('invernaderos', __name__)

@router.route('/', methods=['GET'])
def listar_invernaderos():
    try:
        invernaderos = obtener_invernaderos()
        return jsonify(invernaderos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
