from flask import Blueprint, request, jsonify
from app.queries.umbral_queries import (
    listar_umbrales, 
    crear_umbral,
    actualizar_umbral,
    eliminar_umbral
    )

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

@router.route('/', methods=['POST'])
def crear_nuevo_umbral():
    try:
        data = request.get_json()
        resultado = crear_umbral(data)
        if "error" in resultado:
            return jsonify(resultado), 400
        return jsonify(resultado), 201
    except Exception as e:
        print(f"[ERROR] al crear umbral: {e}")
        return jsonify({"error": "Error al crear umbral"}), 500
    
@router.route('/<int:umbral_id>', methods=['PUT'])
def actualizar_umbral_route(umbral_id):
    try:
        data = request.get_json()
        resultado = actualizar_umbral(umbral_id, data)
        if "error" in resultado:
            return jsonify(resultado), 404
        return jsonify(resultado), 200
    except Exception as e:
        print(f"[ERROR] en PUT /umbrales/{umbral_id}: {e}")
        return jsonify({"error": "Error al actualizar umbral"}), 500
    
@router.route('/<int:umbral_id>', methods=['DELETE'])
def eliminar_umbral_route(umbral_id):
    try:
        resultado = eliminar_umbral(umbral_id)
        if "error" in resultado:
            return jsonify(resultado), 404
        return jsonify(resultado), 200
    except Exception as e:
        print(f"[ERROR] en DELETE /umbrales/{umbral_id}: {e}")
        return jsonify({"error": "Error al eliminar umbral"}), 500