from flask import Blueprint, request, jsonify, g
from app import db
from app.queries.alerta_queries import listar_alertas
from app.models.alerta import Alerta
from app.utils.auth_supabase import usuario_autenticado_requerido
from datetime import datetime

router = Blueprint('alertas', __name__)

@router.route('/', methods=['GET'])
def obtener_alertas():
    try:
        filtros = {
            "estado": request.args.get("estado"),
            "nivel": request.args.get("nivel"),
            "invernadero_id": request.args.get("invernadero_id", type=int),
            "zona_id": request.args.get("zona_id", type=int),
            "busqueda": request.args.get("busqueda"),
            "page": request.args.get("page", default=1, type=int),
            "perPage": request.args.get("perPage", default=20, type=int)
        }
        resultado = listar_alertas(filtros)
        return jsonify(resultado), 200
    except Exception as e:
        print(f"[ERROR] al obtener alertas: {e}")
        return jsonify({"error": "Error al obtener alertas"}), 500
    
@router.route('/<int:alerta_id>/resolver', methods=['PATCH'])
@usuario_autenticado_requerido
def resolver_alerta(alerta_id):
    try:
        alerta = Alerta.query.get(alerta_id)
        if not alerta:
            return jsonify({"error": "Alerta no encontrada"}), 404

        if alerta.estado == "Resuelta":
            return jsonify({"error": "La alerta ya fue resuelta"}), 400

        # Recuperar el Supabase UID desde JWT validado
        usuario = g.usuario
        
        alerta.estado = "Resuelta"
        alerta.fecha_resolucion = datetime.utcnow()
        alerta.resuelta_por = usuario.id
        db.session.commit()

        return jsonify({
            "mensaje": "Alerta resuelta correctamente",
            "resuelta_por": f"{usuario.nombre} {usuario.apellido}",
            "fecha_resolucion": alerta.fecha_resolucion.isoformat()
        }), 200

    except Exception as e:
        print(f"[ERROR] al resolver alerta: {e}")
        return jsonify({"error": "Error al resolver alerta"}), 500