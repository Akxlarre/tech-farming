from flask import request, g, jsonify, Blueprint
from sqlalchemy import func, or_
from app import db
from app.models.invernadero import Invernadero
from app.models.zona import Zona
from app.models.alerta import Alerta
from app.models.sensor_parametro import SensorParametro
from app.utils.auth_supabase import usuario_autenticado_requerido

router = Blueprint('invernaderos', __name__)

@router.route('/', methods=['GET'])
def listar_invernaderos():
    try:
        # 1) Leer parámetros de paginación y filtro
        page     = int(request.args.get('page', 1))
        pageSize = int(request.args.get('pageSize', 8))
        search   = request.args.get('search', '').strip().lower()
        sortBy   = request.args.get('sortBy', '').strip()

        # 2) Base query con (opcional) filtro por nombre
        query = Invernadero.query
        if search:
            query = query.filter(func.lower(Invernadero.nombre).like(f"%{search}%"))

        total = query.count()
        invernaderos = query.offset((page - 1) * pageSize).limit(pageSize).all()

        result = []

        for inv in invernaderos:
            # 3) Calcular zonas y sensores activos
            zonas_activas    = [z for z in inv.zonas if z.activo]
            sensores         = [s for z in zonas_activas for s in z.sensores]
            sensores_activos = [s for s in sensores if s.estado == 'Activo']

            # 4) IDs de sensores y de sus SensorParametro
            sensor_ids = [s.id for s in sensores]
            param_ids  = db.session.query(SensorParametro.id).filter(
                SensorParametro.sensor_id.in_(sensor_ids)
            )

            # 5) Contar alertas activas (cualquier nivel)
            alertas_activas = db.session.query(func.count(Alerta.id)).filter(
                Alerta.estado == 'Activa',
                or_(
                    Alerta.sensor_parametro_id.in_(param_ids),
                    Alerta.sensor_id.in_(sensor_ids)
                )
            ).all()
            alertas_activas = len(alertas)

            niveles = [a.nivel for a in alertas]
            if 'Crítico' in niveles:
                nivel_alerta = 'Crítico'
            elif 'Advertencia' in niveles:
                nivel_alerta = 'Advertencia'
            else:
                nivel_alerta = None

            hay_alertas = alertas_activas > 0

            hay_alertas = alertas_activas > 0

            # 6) Formatear el texto de “estado”
            if alertas_activas == 0:
                estado = "Sin alertas"
            elif alertas_activas == 1:
                estado = "1 alerta activa"
            else:
                estado = f"{alertas_activas} alertas activas"

            # 7) Armar el objeto final para este invernadero
            result.append({
                "id":             inv.id,
                "nombre":         inv.nombre,
                "descripcion":    inv.descripcion,
                "creado_en":      inv.creado_en.isoformat() if inv.creado_en else None,
                "zonasActivas":   len(zonas_activas),
                "sensoresActivos": len(sensores_activos),
                "estado":         estado,
                "hayAlertas":     hay_alertas,
                "zonas": [
                    {
                        "id":         z.id,
                        "nombre":     z.nombre,
                        "descripcion": z.descripcion,
                        "activo":     z.activo,
                        "creado_en":  z.creado_en.isoformat() if z.creado_en else None
                    }
                    for z in inv.zonas
                ]
            })

        # 8) Si viene sortBy, lo aplicamos al array result
        if sortBy:
            desc = sortBy.startswith('-')
            key  = sortBy.lstrip('-')
            if key in ['nombre', 'creado_en', 'zonasActivas', 'sensoresActivos']:
                result.sort(key=lambda x: x.get(key), reverse=desc)

        return jsonify({
            "data":  result,
            "total": total
        }), 200

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
            param_ids = db.session.query(SensorParametro.id).filter(
                SensorParametro.sensor_id.in_(sensor_ids)
            )

            # ANTES:
            # alertas_activas = db.session.query(Alerta).filter(
            #     Alerta.sensor_parametro_id.in_(param_ids),
            #     Alerta.estado == 'activo'
            # ).count()

            # AHORA: contar alertas activas sin importar su nivel
            alertas_activas = db.session.query(func.count(Alerta.id)).filter(
                Alerta.estado == 'Activa',
                or_(
                    Alerta.sensor_parametro_id.in_(param_ids),
                    Alerta.sensor_id.in_(sensor_ids)
                )
            ).all()
            alertas_activas = len(alertas)

            niveles = [a.nivel for a in alertas]
            if 'Crítico' in niveles:
                nivel_alerta = 'Crítico'
            elif 'Advertencia' in niveles:
                nivel_alerta = 'Advertencia'
            else:
                nivel_alerta = None

            hay_alertas = alertas_activas > 0

            hay_alertas = alertas_activas > 0

            if alertas_activas == 0:
                estado = "Sin alertas"
            elif alertas_activas == 1:
                estado = "1 alerta activa"
            else:
                estado = f"{alertas_activas} alertas activas"

            result.append({
                "id": inv.id,
                "estado": estado,
                "hayAlertas": hay_alertas
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
                    "creado_en": z.creado_en.isoformat() if z.creado_en else None,
                    "sensores": [{"id": s.id, "nombre": s.nombre} for s in z.sensores]
                }
                for z in inv.zonas
            ]
        }), 200

    except Exception as e:
        return jsonify({"error": "No se pudo obtener el invernadero"}), 500

@router.route('/', methods=['POST'])
@usuario_autenticado_requerido
def crear_invernadero():
    if not getattr(g.permisos, "puede_crear", False):
        return jsonify({"error": "No tienes permiso para crear invernaderos"}), 403
    
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

#
# ─── NUEVO ENDPOINT: ACTUALIZAR INVERNADERO COMPLETO ───────────────────────────────
#
@router.route('/<int:inv_id>', methods=['PUT'])
@usuario_autenticado_requerido
def actualizar_invernadero_completo(inv_id):
    if not getattr(g.permisos, "puede_editar", False):
        return jsonify({"error": "No tienes permiso para editar invernaderos"}), 403
    """
    PUT /api/invernaderos/{inv_id}
    Payload esperado (JSON):
    {
      "nombre": string,
      "descripcion": string (opcional),
      "zonas": [
        { "id": 5, "nombre": "Zona A", "descripcion": "", "activo": true },   # actualizar
        { "id": None, "nombre": "Zona Nueva", "descripcion": "", "activo": true }  # crear
      ],
      "zonasEliminadas": [3, 7]   # IDs de zonas que se eliminarán en cascada
    }
    """
    data = request.get_json() or {}
    nombre = data.get('nombre')
    descripcion = data.get('descripcion', '')
    zonas_payload = data.get('zonas', [])
    zonas_eliminadas = data.get('zonasEliminadas', [])
    print(f"[BACKEND] actualizar_invernadero_completo recibió zonasEliminadas = {zonas_eliminadas}")
    if not nombre or not isinstance(zonas_payload, list):
        return jsonify({"error": "Payload inválido: falta 'nombre' o 'zonas' no es lista"}), 400

    # 1) Obtener y verificar que exista el invernadero
    inv = Invernadero.query.get_or_404(inv_id, description="Invernadero no encontrado")

    try:
        # 2) Actualizar campos generales del invernadero
        inv.nombre = nombre
        inv.descripcion = descripcion

        # 3) Procesar zonas para actualizar/crear
        for z in zonas_payload:
            z_id = z.get('id')
            z_nombre = z.get('nombre')
            z_descripcion = z.get('descripcion', '')
            z_activo = z.get('activo', True)

            # Validar nombre básico
            if not z_nombre or not isinstance(z_nombre, str):
                continue  # saltar zonas sin nombre válido

            if z_id:
                # a) Zona ya existe: actualizar
                zona_obj = Zona.query.filter_by(id=z_id, invernadero_id=inv_id).first()
                if zona_obj:
                    zona_obj.nombre = z_nombre
                    zona_obj.descripcion = z_descripcion
                    zona_obj.activo = bool(z_activo)
                else:
                    # Si no existe la zona con ese ID en este invernadero → ignoramos
                    continue
            else:
                # b) Zona nueva: creamos
                nueva_z = Zona(
                    nombre=z_nombre,
                    descripcion=z_descripcion,
                    activo=bool(z_activo),
                    invernadero_id=inv_id
                )
                db.session.add(nueva_z)

        # 4) Procesar zonas a eliminar
        if isinstance(zonas_eliminadas, list):
            for zid in zonas_eliminadas:
                if not isinstance(zid, int):
                    continue
                zona_a_borrar = Zona.query.filter_by(id=zid, invernadero_id=inv_id).first()
                if zona_a_borrar:
                    if zona_a_borrar.activo:
                        db.session.rollback()
                        return jsonify({
                            "error": f"No se puede eliminar la zona '{zona_a_borrar.nombre}' porque aún está activa. Debe marcarla como inactiva antes de eliminarla."
                        }), 400
                    db.session.delete(zona_a_borrar)
                    # gracias a cascade="all, delete-orphan", se borran sensores y alertas asociadas
        # 5) Confirmar cambios
        db.session.commit()
        return jsonify({"success": True}), 200

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] al actualizar invernadero {inv_id}: {e}")
        return jsonify({"error": "Error al actualizar invernadero"}), 500

#
# ─── NUEVO ENDPOINT: RESUMEN DE BORRADO ───────────────────────────────────────────────
#
@router.route('/<int:inv_id>/delete-summary', methods=['GET'])
def resumen_borrado_invernadero(inv_id):
    inv = Invernadero.query.options(
        db.joinedload(Invernadero.zonas).joinedload(Zona.sensores)
    ).get_or_404(inv_id, description="Invernadero no encontrado")

    # 1) Todas las zonas del invernadero, sin importar si están activas o no
    todos_sensores = [s for z in inv.zonas for s in z.sensores]
    sensor_ids = [s.id for s in todos_sensores]

    # 2) Obtener IDs de SensorParametro ligados a esos sensores
    param_ids_subq = (
        db.session.query(SensorParametro.id)
        .filter(SensorParametro.sensor_id.in_(sensor_ids))
        .subquery()
    )

    total_alertas = db.session.query(func.count(Alerta.id)).filter(
        or_(
            Alerta.sensor_parametro_id.in_(param_ids_subq),
            Alerta.sensor_id.in_(sensor_ids)
        )
    ).scalar()

    return jsonify({
        "invernaderoId": inv_id,
        "zonasCount": len(inv.zonas),
        "sensoresCount": len(todos_sensores),
        "alertasCount": total_alertas
    }), 200
#
# ─── ENDPOINT PARA BORRAR UN INVERNADERO COMPLETO ─────────────────────────────────
#
@router.route('/<int:inv_id>', methods=['DELETE'])
@usuario_autenticado_requerido
def eliminar_invernadero(inv_id):
    if not getattr(g.permisos, "puede_eliminar", False):
        return jsonify({"error": "No tienes permiso para editar invernaderos"}), 403
    """
    DELETE /api/invernaderos/{inv_id}
    Elimina el invernadero y, en cascada, sus zonas (y sensores y alertas).
    """
    inv = Invernadero.query.options(db.joinedload(Invernadero.zonas)).get_or_404(
        inv_id, description="Invernadero no encontrado"
    )

    zonas_activas = [z for z in inv.zonas if z.activo]
    if zonas_activas:
        return jsonify({
            "error": "No se puede eliminar el invernadero: todas sus zonas deben estar inactivas."
        }), 400
    
    try:
        db.session.delete(inv)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] al eliminar invernadero {inv_id}: {e}")
        return jsonify({"error": "No se pudo eliminar el invernadero"}), 500

@router.route('/<int:inv_id>/alertas-activas-count', methods=['GET'])
def contar_alertas_activas(inv_id):
    inv = Invernadero.query.get_or_404(inv_id, description="Invernadero no encontrado")

    # Obtener todas las zonas activas de este invernadero
    zonas_activas = Zona.query.filter_by(invernadero_id=inv_id, activo=True).all()

    # Extraer IDs de todos los sensores en esas zonas
    sensor_ids = [s.id for z in zonas_activas for s in z.sensores]
    if len(sensor_ids) == 0:
        return jsonify({"alertasActivasCount": 0}), 200

    # IDs de SensorParametro asociados a esos sensores
    param_ids_subq = (
        db.session.query(SensorParametro.id)
        .filter(SensorParametro.sensor_id.in_(sensor_ids))
        .subquery()
    )
    total_activas = (
        db.session.query(func.count(Alerta.id))
        .filter(
            Alerta.estado == 'Activa',
            or_(
                Alerta.sensor_parametro_id.in_(param_ids_subq),
                Alerta.sensor_id.in_(sensor_ids)
            )
        )
        .scalar()
    )

    return jsonify({"alertasActivasCount": total_activas}), 200