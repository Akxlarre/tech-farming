from flask import Blueprint, request, jsonify
from app.queries.umbral_queries import listar_umbrales

router = Blueprint('umbrales', __name__)

@router.route('/', methods=['GET'])
def obtener_umbrales():
    try:
        filtros = {
            "ambito": request.args.get("ambito"),
            "tipo_parametro_id": request.args.get("tipo_parametro_id", type=int),
            "invernadero_id": request.args.get("invernadero_id", type=int),
            "sensor_parametro_id": request.args.get("sensor_parametro_id", type=int)
        }
        umbrales = listar_umbrales(filtros)
        return jsonify(umbrales), 200
    except Exception as e:
        print(f"[ERROR] al obtener umbrales: {e}")
        return jsonify({"error": "Error al obtener umbrales"}), 500
