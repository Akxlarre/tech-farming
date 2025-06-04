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
        puede_eliminar=True
    )
    db.session.add(permisos)
    db.session.commit()

    return jsonify({"mensaje": "Usuario y permisos creados correctamente"}), 201

@router.route('/trabajadores', methods=['GET'])
def listar_trabajadores():
    admin_id = request.args.get('admin_id', type=int)
    if not admin_id:
        return jsonify({"error": "Falta admin_id"}), 400

    trabajadores = Usuario.query.filter_by(usuario_admin_id=admin_id).all()
    resultado = []
    for t in trabajadores:
        permisos = UsuarioPermiso.query.filter_by(usuario_id=t.id).first()
        resultado.append({
            "id": t.id,
            "nombre": t.nombre,
            "apellido": t.apellido,
            "telefono": t.telefono,
            "puedeEditar": permisos.puede_editar if permisos else False,
            "puedeCrear": permisos.puede_crear if permisos else False,
            "puedeEliminar": permisos.puede_eliminar if permisos else False,
        })
    return jsonify(resultado), 200

@router.route('/trabajadores', methods=['POST'])
def crear_trabajador():
    data = request.get_json()
    admin_id = request.args.get('admin_id', type=int)

    nombre = data.get('nombre')
    apellido = data.get('apellido')
    telefono = data.get('telefono')
    supabase_uid = data.get('supabase_uid')  # ← viene desde el frontend
    permisos = data.get('permisos', {})

    if not all([admin_id, nombre, apellido, supabase_uid]):
        return jsonify({"error": "Faltan campos requeridos"}), 400

    rol_trabajador = Rol.query.filter_by(nombre='Trabajador').first()
    if not rol_trabajador:
        return jsonify({"error": "Rol 'Trabajador' no existe"}), 500

    nuevo_usuario = Usuario(
        nombre=nombre,
        apellido=apellido,
        telefono=telefono,
        rol_id=rol_trabajador.id,
        usuario_admin_id=admin_id,
        supabase_uid=supabase_uid,
        fecha_creacion=datetime.utcnow()
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

    return jsonify({"mensaje": "Trabajador creado correctamente"}), 201

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



