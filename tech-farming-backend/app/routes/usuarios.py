from flask import Blueprint, request, jsonify
from app import db
from app.models.usuario import Usuario
from app.models.usuario_permiso import UsuarioPermiso
from app.models.rol import Rol
from datetime import datetime

router = Blueprint('usuarios', __name__)

@router.route('/supabase-webhook', methods=['POST'])
def crear_usuario_desde_supabase():
    data = request.get_json()

    supabase_uid = data.get('id')  # ID de Supabase Auth

    if not supabase_uid:
        return jsonify({"error": "Falta el ID del usuario de Supabase"}), 400

    if Usuario.query.filter_by(supabase_uid=supabase_uid).first():
        return jsonify({"mensaje": "El usuario ya existe"}), 200
    
    # Buscar rol 'Administrador'
    rol_admin = Rol.query.filter_by(nombre='Administrador').first()
    if not rol_admin:
        return jsonify({"error": "Rol 'Administrador' no existe"}), 500

    nuevo_usuario = Usuario(
        supabase_uid=supabase_uid,
        rol_id=rol_admin.id,
        fecha_creacion=datetime.utcnow()
    )
    db.session.add(nuevo_usuario)
    db.session.flush()

    # Asignar permisos 'True'
    permisos = UsuarioPermiso(
        usuario_id=nuevo_usuario.id,
        puede_crear=True,
        puede_editar=True,
        puede_eliminar=True,
        puede_ver=True
    )
    db.session.add(permisos)
    db.session.commit()

    return jsonify({"mensaje": "Usuario y permisos creados correctamente"}), 201
