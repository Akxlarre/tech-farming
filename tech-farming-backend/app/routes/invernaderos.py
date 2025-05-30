from flask import request, jsonify,Blueprint
from sqlalchemy import func
from app import db
from app.models.invernadero import Invernadero
from app.models.zona import Zona
from app.models.sensor import Sensor
from app.models.alerta import Alerta
from app.models.sensor_parametro import SensorParametro

router = Blueprint('invernaderos', __name__)


@router.route('/', methods=['GET'])
def listar_invernaderos():
    try:
        # Query params
        page     = int(request.args.get('page', 1))
        pageSize = int(request.args.get('pageSize', 8))
        search   = request.args.get('search', '').strip().lower()
        sortBy   = request.args.get('sortBy', '').strip()  # ej: nombre, -creado_en, zonasActivas

        # Filtro básico
        query = Invernadero.query
        if search:
            query = query.filter(func.lower(Invernadero.nombre).like(f"%{search}%"))

        total = query.count()
        invernaderos = query.offset((page - 1) * pageSize).limit(pageSize).all()

        result = []

        for inv in invernaderos:
            zonas_activas = [z for z in inv.zonas if z.activo]
            sensores = [s for z in zonas_activas for s in z.sensores]
            sensores_activos = [s for s in sensores if s.estado == 'Activo']

            # Buscar alertas activas
            sensor_ids = [s.id for s in sensores]
            param_ids = db.session.query(SensorParametro.id).filter(SensorParametro.sensor_id.in_(sensor_ids))
            alertas_activas = db.session.query(Alerta).filter(
                Alerta.sensor_parametro_id.in_(param_ids),
                Alerta.estado == 'activo'
            ).count()

            estado = (
                "1 alerta activa" if alertas_activas == 1
                else f"{alertas_activas} alertas activas" if alertas_activas > 1
                else "Sin alertas"
            )



            # ✅ Agregamos las zonas como array de objetos
            zonas = [{
                "id": z.id,
                "nombre": z.nombre,
                "descripcion": z.descripcion,
                "activo": z.activo,
                "creado_en": z.creado_en.isoformat() if z.creado_en else None
            } for z in inv.zonas]

            result.append({
                "id": inv.id,
                "nombre": inv.nombre,
                "descripcion": inv.descripcion,
                "creado_en": inv.creado_en.isoformat() if inv.creado_en else None,
                "zonasActivas": len(zonas_activas),
                "sensoresActivos": len(sensores_activos),
                "estado": estado,
                "zonas": zonas  # ← aquí se incluyen
            })

        # Ordenar resultado final
        if sortBy:
            desc = sortBy.startswith('-')
            key = sortBy.lstrip('-')
            if key in ['nombre', 'creado_en', 'zonasActivas', 'sensoresActivos']:
                result.sort(key=lambda x: x.get(key), reverse=desc)

        return jsonify({
            "data": result,
            "total": total
        })

    except Exception as e:
        print(f"[ERROR] al obtener invernaderos: {e}")
        return jsonify({"error": str(e)}), 500
    
@router.route('/getInvernaderos', methods=['GET'])
def get_invernaderos():
    try:
        invernaderos = Invernadero.query.all()
        result = [{
            "id": inv.id,
            "nombre": inv.nombre,
            "descripcion": inv.descripcion,
            "creado_en": inv.creado_en.isoformat() if inv.creado_en else None
        } for inv in invernaderos]
        return jsonify(result), 200
    except Exception as e:
        print(f"[ERROR] al obtener invernaderos: {e}")
        return jsonify({"error": str(e)}), 500
    
@router.route('/estados-alerta', methods=['GET'])
def estados_alerta():
    try:
        page     = int(request.args.get('page', 1))
        pageSize = int(request.args.get('pageSize', 8))

        query = Invernadero.query
        invernaderos = query.offset((page - 1) * pageSize).limit(pageSize).all()

        result = []
        for inv in invernaderos:
            zonas_activas = [z for z in inv.zonas if z.activo]
            sensores = [s for z in zonas_activas for s in z.sensores]

            sensor_ids = [s.id for s in sensores]
            param_ids = db.session.query(SensorParametro.id).filter(SensorParametro.sensor_id.in_(sensor_ids))

            alertas_activas = db.session.query(Alerta).filter(
                Alerta.sensor_parametro_id.in_(param_ids),
                Alerta.estado == 'activo'
            ).count()

            if alertas_activas == 0:
                estado = "Sin alertas"
            elif alertas_activas == 1:
                estado = "1 alerta activa"
            else:
                estado = f"{alertas_activas} alertas activas"

            result.append({
                "id": inv.id,
                "estado": estado
            })

        return jsonify(result), 200

    except Exception as e:
        print(f"[ERROR] en /estados-alerta: {e}")
        return jsonify({"error": str(e)}), 500
    
@router.route('/<int:inv_id>', methods=['GET'])
def obtener_invernadero(inv_id):
    try:
        inv = (
            Invernadero.query
            .options(
                db.joinedload(Invernadero.zonas).joinedload(Zona.sensores)
            )
            .get_or_404(inv_id, description="Invernadero no encontrado")
        )

        return jsonify({
            "id": inv.id,
            "nombre": inv.nombre,
            "descripcion": inv.descripcion,
            "creado_en": inv.creado_en.isoformat() if inv.creado_en else None,
            "zonas": [
                {
                    "id": z.id,
                    "nombre": z.nombre,
                    "descripcion": z.descripcion,
                    "activo": z.activo,
                    "sensores_count": len(z.sensores),
                    "sensores": [{"id": s.id, "nombre": s.nombre} for s in z.sensores]  # opcional
                }
                for z in inv.zonas
            ]
        }), 200

    except Exception as e:
        return jsonify({"error": "No se pudo obtener el invernadero"}), 500

    
@router.route('/', methods=['POST'])
def crear_invernadero():
    data = request.get_json() or {}
    nombre = data.get('nombre')
    descripcion = data.get('descripcion', '')
    zonas = data.get('zonas', [])

    if not nombre or not isinstance(zonas, list) or len(zonas) == 0:
        return jsonify({"error": "nombre y al menos una zona son requeridos"}), 400

    try:
        nuevo_inv = Invernadero(nombre=nombre, descripcion=descripcion)
        db.session.add(nuevo_inv)
        db.session.flush()  # obtener ID antes del commit

        for z in zonas:
            nueva_zona = Zona(
                nombre=z.get('nombre'),
                descripcion=z.get('descripcion', ''),
                invernadero_id=nuevo_inv.id,
                activo=True
            )
            db.session.add(nueva_zona)

        db.session.commit()

        return jsonify({
            "id": nuevo_inv.id,
            "nombre": nuevo_inv.nombre,
            "descripcion": nuevo_inv.descripcion,
            "creado_en": nuevo_inv.creado_en.isoformat() if nuevo_inv.creado_en else None
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear el invernadero"}), 500
    
