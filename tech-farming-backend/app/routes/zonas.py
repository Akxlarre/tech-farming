# app/routes/zonas.py
from flask import Blueprint, request, jsonify, abort, current_app
from sqlalchemy.exc import SQLAlchemyError
from app import db
from app.models.zona import Zona as ZonaModel
from app.models.invernadero import Invernadero as InvernaderoModel

router = Blueprint('zonas', __name__, url_prefix='/api')

@router.route('/invernaderos/<int:inv_id>/zonas', methods=['GET'])
def listar_zonas_por_invernadero(inv_id):
    inv = InvernaderoModel.query.get_or_404(inv_id, description="Invernadero no encontrado")
    zonas = ZonaModel.query.filter_by(invernadero_id=inv_id).all()
    return jsonify([{
        "id":       z.id,
        "nombre":   z.nombre,
        "descripcion": z.descripcion,
        "activo":   z.activo,
        "creado_en": z.creado_en.isoformat() if z.creado_en else None
    } for z in zonas]), 200

@router.route('/zonas', methods=['POST'])
def crear_zona():
    data = request.get_json() or {}
    inv_id = data.get('invernadero_id')
    nombre = data.get('nombre')
    if not inv_id or not nombre:
        abort(400, description="invernadero_id y nombre son requeridos")
    # validar existencia de invernadero
    if not InvernaderoModel.query.get(inv_id):
        abort(404, description="Invernadero no encontrado")
    z = ZonaModel(
        invernadero_id=inv_id,
        nombre=nombre,
        descripcion=data.get('descripcion'),
        activo=data.get('activo', True)
    )
    try:
        db.session.add(z)
        db.session.commit()
        return jsonify({
            "id": z.id,
            "invernadero_id": z.invernadero_id,
            "nombre": z.nombre,
            "descripcion": z.descripcion,
            "activo": z.activo,
            "creado_en": z.creado_en.isoformat() if z.creado_en else None
        }), 201
    except SQLAlchemyError as e:
        current_app.logger.error(str(e))
        db.session.rollback()
        abort(500, description="Error al crear la zona")

@router.route('/zonas/<int:zona_id>', methods=['PUT'])
def editar_zona(zona_id):
    data = request.get_json() or {}
    z = ZonaModel.query.get_or_404(zona_id, description="Zona no encontrada")
    if 'nombre' in data:
        z.nombre = data['nombre']
    if 'descripcion' in data:
        z.descripcion = data['descripcion']
    if 'activo' in data:
        z.activo = data['activo']
    try:
        db.session.commit()
        return jsonify({
            "id": z.id,
            "invernadero_id": z.invernadero_id,
            "nombre": z.nombre,
            "descripcion": z.descripcion,
            "activo": z.activo,
            "creado_en": z.creado_en.isoformat() if z.creado_en else None
        }), 200
    except SQLAlchemyError as e:
        current_app.logger.error(str(e))
        db.session.rollback()
        abort(500, description="Error al editar la zona")

@router.route('/zonas/<int:zona_id>', methods=['DELETE'])
def eliminar_zona(zona_id):
    z = ZonaModel.query.get_or_404(zona_id, description="Zona no encontrada")
    try:
        db.session.delete(z)
        db.session.commit()
        return '', 204
    except SQLAlchemyError as e:
        current_app.logger.error(str(e))
        db.session.rollback()
        abort(500, description="Error al eliminar la zona")
