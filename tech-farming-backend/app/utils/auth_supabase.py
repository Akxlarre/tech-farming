import os
import requests
from flask import request, abort, jsonify, g
from functools import wraps
from supabase import create_client
from app.models.usuario import Usuario
from app.models.usuario_permiso import UsuarioPermiso

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_AUTH_URL = f"{SUPABASE_URL}/auth/v1/user"
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def obtener_usuario_y_permisos():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        abort(401, description="Falta token de autenticación")

    try:
        user_info = supabase.auth.get_user(token)
    except Exception:
        abort(401, description="Token inválido o expirado")

    uid = user_info.user.id
    usuario = Usuario.query.filter_by(supabase_uid=uid).first()
    if not usuario:
        abort(403, description="Usuario no registrado")

    permisos = UsuarioPermiso.query.filter_by(usuario_id=usuario.id).first()
    if not permisos:
        abort(403, description="Permisos no asignados")
        
    return usuario, permisos

def usuario_autenticado_requerido(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            usuario, permisos = obtener_usuario_y_permisos()
            g.usuario = usuario
            g.permisos = permisos
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": str(e)}), 401

    return decorated_function


def admin_requerido(f):
    """Decorator que garantiza que el usuario es administrador."""

    @usuario_autenticado_requerido
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if getattr(g.usuario, "rol_id", None) != 1:
            return (
                jsonify({"error": "Usuario sin privilegios de administrador"}),
                403,
            )
        return f(*args, **kwargs)

    return decorated_function
