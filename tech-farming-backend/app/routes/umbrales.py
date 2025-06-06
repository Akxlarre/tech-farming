from flask import Blueprint, g, request, jsonify
from app.queries.umbral_queries import (
    listar_umbrales, 
    crear_umbral,
    actualizar_umbral,
    eliminar_umbral
    )
from app.utils.auth_supabase import usuario_autenticado_requerido

router = Blueprint('umbrales', __name__)

@router.route('/', methods=['GET'])
def obtener_umbrales():
    try:
        filtros = {
            "ambito": request.args.get("ambito"),
            "tipo_parametro_id": request.args.get("tipo_parametro_id", type=int),
            "invernadero_id": request.args.get("invernadero_id", type=int),
            "sensor_parametro_id": request.args.get("sensor_parametro_id", type=int),
            "page": request.args.get("page", default=1, type=int),
            "perPage": request.args.get("perPage", default=10, type=int)
        }
        resultado = listar_umbrales(filtros)
        return jsonify(resultado), 200
    except Exception as e:
        print(f"[ERROR] al obtener umbrales: {e}")
        return jsonify({"error": "Error al obtener umbrales"}), 500

@router.route('/', methods=['POST'])
@usuario_autenticado_requerido
def crear_nuevo_umbral():
    if not getattr(g.permisos, "puede_crear", False):
        return jsonify({"error": "No tienes permiso para crear umbrales"}), 403
    
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
@usuario_autenticado_requerido
def actualizar_umbral_route(umbral_id):
    if not getattr(g.permisos, "puede_editar", False):
        return jsonify({"error": "No tienes permiso para editar umbrales"}), 403
    
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
@usuario_autenticado_requerido
def eliminar_umbral_route(umbral_id):
    if not getattr(g.permisos, "puede_eliminar", False):
        return jsonify({"error": "No tienes permiso para eliminar umbrales"}), 403
    
    try:
        resultado = eliminar_umbral(umbral_id)
        if "error" in resultado:
            return jsonify(resultado), 404
        return jsonify(resultado), 200
    except Exception as e:
        print(f"[ERROR] en DELETE /umbrales/{umbral_id}: {e}")
        return jsonify({"error": "Error al eliminar umbral"}), 500