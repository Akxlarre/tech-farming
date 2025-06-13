from flask import Blueprint, request, jsonify, g
from app import db
from app.models.usuario import Usuario
from app.models.usuario_permiso import UsuarioPermiso
from app.models.rol import Rol
from datetime import datetime
from zoneinfo import ZoneInfo
from supabase import create_client
from app.utils.auth_supabase import usuario_autenticado_requerido
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

router = Blueprint('usuarios', __name__)

@router.route('/supabase-webhook', methods=['POST'])
def crear_usuario_desde_supabase():
    data = request.get_json()

    supabase_uid = data.get('id')  # ID del usuario desde Supabase Auth
    email = data.get('email') # Email del usuario desde Supabase Auth

    if not supabase_uid:
        return jsonify({"error": "Falta el ID del usuario de Supabase"}), 400

    if Usuario.query.filter_by(supabase_uid=supabase_uid).first():
        return jsonify({"mensaje": "El usuario ya existe"}), 200

    nuevo_usuario = Usuario(
        supabase_uid=supabase_uid,
        email=email,
        rol_id=1,
        fecha_creacion=datetime.now(ZoneInfo("America/Santiago"))
    )
    db.session.add(nuevo_usuario)
    db.session.flush()

    # Asignar permisos 'True'
    permisos = UsuarioPermiso(
        usuario_id=nuevo_usuario.id,
        puede_crear=True,
        puede_editar=True,
        puede_eliminar=True
    )
    db.session.add(permisos)
    db.session.commit()

    return jsonify({"mensaje": "Usuario y permisos creados correctamente"}), 201

@router.route('/trabajadores', methods=['POST'])
def invitar_usuario():
    data = request.get_json()

    email = data.get('email')
    nombre = data.get('nombre')
    apellido = data.get('apellido')
    telefono = data.get('telefono')
    permisos = data.get('permisos', {})

    if not email:
        return jsonify({"error": "Email requerido"}), 400

    redirect_url = f"http://localhost:4200/set-password?invitacion=true"

    # Invitar usuario con Supabase Admin API
    try:
        response = supabase.auth.admin.invite_user_by_email(email, {
            "redirect_to": redirect_url
        })
    except Exception as e:
        original_msg = str(e)
        current_app.logger.error(original_msg)
        error_msg = original_msg
        translations = {
            "Invalid email": "Correo electrónico inválido",
            "User already exists": "El usuario ya existe",
            "Email rate limit": "Límite de envío de correos excedido",
        }
        for eng, esp in translations.items():
            if eng.lower() in error_msg.lower():
                error_msg = esp
                break
        return jsonify({"error": error_msg}), 400

    if response.user is None:
        return jsonify({"error": "Error al invitar usuario con Supabase"}), 400

    supabase_uid = response.user.id
    # Guardar en DB
    nuevo_usuario = Usuario(
        nombre=nombre,
        apellido=apellido,
        email=email,
        telefono=telefono,
        rol_id=2,
        supabase_uid=supabase_uid,
        fecha_creacion=datetime.now(ZoneInfo("America/Santiago"))
    )
    db.session.add(nuevo_usuario)
    db.session.flush()

    nuevo_permiso = UsuarioPermiso(
        usuario_id=nuevo_usuario.id,
        puede_editar=permisos.get('editar', False),
        puede_crear=permisos.get('crear', False),
        puede_eliminar=permisos.get('eliminar', False)
    )
    db.session.add(nuevo_permiso)
    db.session.commit()

    return jsonify({"mensaje": "Usuario invitado y registrado correctamente"}), 201

@router.route('/trabajadores', methods=['GET'])
def listar_trabajadores():
    trabajadores = Usuario.query.join(Rol).filter(Rol.nombre == 'Trabajador').all()
    resultado = []
    for t in trabajadores:
        permisos = UsuarioPermiso.query.filter_by(usuario_id=t.id).first()
        resultado.append({
            "id": t.id,
            "nombre": t.nombre,
            "apellido": t.apellido,
            "email": t.email,
            "telefono": t.telefono,
            "puedeEditar": permisos.puede_editar if permisos else False,
            "puedeCrear": permisos.puede_crear if permisos else False,
            "puedeEliminar": permisos.puede_eliminar if permisos else False,
        })
    return jsonify(resultado), 200

@router.route('/trabajadores/<int:usuario_id>', methods=['PATCH'])
def actualizar_permisos(usuario_id):
    data = request.get_json()
    permisos = UsuarioPermiso.query.filter_by(usuario_id=usuario_id).first()

    if not permisos:
        return jsonify({"error": "Permisos no encontrados"}), 404

    permisos.puede_editar = data.get('editar', permisos.puede_editar)
    permisos.puede_crear = data.get('crear', permisos.puede_crear)
    permisos.puede_eliminar = data.get('eliminar', permisos.puede_eliminar)

    db.session.commit()
    return jsonify({"mensaje": "Permisos actualizados correctamente"}), 200

@router.route('/trabajadores/<int:usuario_id>', methods=['DELETE'])
@usuario_autenticado_requerido
def eliminar_trabajador(usuario_id):
    if not getattr(g.permisos, "puede_eliminar", False):
        return jsonify({"error": "No tienes permiso para eliminar usuarios"}), 403

    usuario = Usuario.query.get_or_404(usuario_id, description="Usuario no encontrado")
    try:
        UsuarioPermiso.query.filter_by(usuario_id=usuario.id).delete()
        db.session.delete(usuario)
        db.session.commit()
        return '', 204
    except Exception:
        db.session.rollback()
        return jsonify({"error": "No se pudo eliminar el usuario"}), 500
