import traceback
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from uuid import uuid4
from flask import Blueprint, g, request, jsonify, abort, current_app
from sqlalchemy.orm import joinedload
from influxdb_client import Point

from app import influx_client as client, db
from app.models.sensor import Sensor as SensorModel
from app.models.zona import Zona as ZonaModel
from app.models.invernadero import Invernadero as InvernaderoModel
from app.models.sensor_parametro import SensorParametro as SensorParametroModel
from app.models.tipo_parametro import TipoParametro as TipoParametroModel
from app.models.tipo_sensor import TipoSensor as TipoSensorModel
from app.queries.sensor_queries import (
    obtener_sensores_por_invernadero_y_parametro,
    obtener_sensores_por_invernadero)
from app.queries.alerta_queries import evaluar_y_generar_alerta
from app.utils.auth_supabase import usuario_autenticado_requerido

router = Blueprint('sensores', __name__, url_prefix='/api/sensores')


@router.route('/', methods=['GET'])
def listar_sensores():
    try:
        # paging params
        page     = max(int(request.args.get('page', 1)), 1)
        pageSize = max(int(request.args.get('pageSize', 10)), 1)
        offset   = (page - 1) * pageSize

        # base query
        q = db.session.query(SensorModel)

        # ** filtros **
        # 1) invernadero → join Zona → filtrar por Zona.invernadero_id
        inv_id = request.args.get('invernadero')
        if inv_id:
            q = q.join(SensorModel.zona).filter(ZonaModel.invernadero_id == int(inv_id))

        # 2) zona directa (sensor.zona_id)
        zona_id = request.args.get('zona')
        if zona_id:
            q = q.filter(SensorModel.zona_id == int(zona_id))

        # 3) tipo de sensor
        tipo_id = request.args.get('tipoSensor')
        if tipo_id:
            q = q.filter(SensorModel.tipo_sensor_id == int(tipo_id))

        # 4) estado
        estado = request.args.get('estado')
        if estado:
            q = q.filter(SensorModel.estado == estado)

        # 5) búsqueda por nombre
        search = request.args.get('search')
        if search:
            term = f"%{search}%"
            q = q.filter(SensorModel.nombre.ilike(term))

        # ordenar
        sort = request.args.get('sortBy')
        if sort:
            desc = sort.startswith('-')
            col_name = sort.lstrip('-')
            col_attr = getattr(SensorModel, col_name, None)
            if col_attr is not None:
                q = q.order_by(col_attr.desc() if desc else col_attr)
        else:
            q = q.order_by(SensorModel.id)

        total = q.count()

        sensores = (
            q
            .options(
                joinedload(SensorModel.zona).joinedload(ZonaModel.invernadero),
                joinedload(SensorModel.tipo_sensor),
                joinedload(SensorModel.parametros).joinedload(SensorParametroModel.tipo_parametro)
            )
            .offset(offset)
            .limit(pageSize)
            .all()
        )

        salida = []
        for s in sensores:
            zona = s.zona
            inv  = zona.invernadero if zona else None
            params = [
                {
                    "id": sp.tipo_parametro.id,            
                    "nombre": sp.tipo_parametro.nombre,
                    "unidad": getattr(sp.tipo_parametro, "unidad", "")
                }
                for sp in s.parametros
            ]
            salida.append({
                "id":                s.id,
                "nombre":            s.nombre,
                "descripcion":       s.descripcion,
                "estado":            s.estado,
                "fecha_instalacion": s.fecha_instalacion.isoformat() if s.fecha_instalacion else None,
                "tipo_sensor":       {"id": s.tipo_sensor.id, "nombre": s.tipo_sensor.nombre},
                "zona":              {"id": zona.id, "nombre": zona.nombre} if zona else None,
                "invernadero":       {"id": inv.id,  "nombre": inv.nombre}  if inv else None,
                "parametros":        params
            })

        return jsonify({ "data": salida, "total": total }), 200

    except Exception:
        current_app.logger.error("Error listar_sensores:\n" + traceback.format_exc())
        return jsonify({"error": "Error interno al listar sensores"}), 500


@router.route('/', methods=['POST'])
@usuario_autenticado_requerido
def crear_sensor():
    if not getattr(g.permisos, "puede_crear", False):
        return jsonify({"error": "No tienes permiso para crear sensores"}), 403
    
    data = request.get_json() or {}

    nombre      = data.get('nombre')
    descripcion = data.get('descripcion', '')
    estado      = data.get('estado', 'Activo')

    try:
        tipo_sensor_id  = int(data.get('tipo_sensor_id'))
        invernadero_id  = int(data.get('invernadero_id'))
    except (TypeError, ValueError):
        abort(400, description="tipo_sensor_id e invernadero_id deben ser enteros válidos")

    zona_id_raw = data.get('zona_id')
    zona_id     = None
    if zona_id_raw not in (None, '', 0):
        try:
            zona_id = int(zona_id_raw)
        except (TypeError, ValueError):
            abort(400, description="zona_id debe ser un entero válido")

    parametro_ids = data.get('parametro_ids', [])
    if not isinstance(parametro_ids, list):
        abort(400, description="parametro_ids debe ser una lista de enteros")

    if not nombre:
        abort(400, description="El nombre es obligatorio")

    inv = InvernaderoModel.query.get(invernadero_id)
    if not inv:
        abort(404, description="Invernadero no encontrado")

    if zona_id is not None:
        zona = ZonaModel.query.get(zona_id)
        if not zona or zona.invernadero_id != invernadero_id:
            abort(400, description="Zona inválida para ese invernadero")

    token = uuid4().hex

    sensor = SensorModel(
        nombre=nombre,
        descripcion=descripcion,
        estado=estado,
        fecha_instalacion=datetime.utcnow(),
        tipo_sensor_id=tipo_sensor_id,
        token=token
    )
    sensor.invernadero_id = invernadero_id
    if zona_id is not None:
        sensor.zona_id = zona_id

    for pid in parametro_ids:
        try:
            pid_int = int(pid)
            sp = SensorParametroModel(sensor=sensor, tipo_parametro_id=pid_int)
            sensor.parametros.append(sp)
        except (TypeError, ValueError):
            continue

    try:
        db.session.add(sensor)
        db.session.commit()
        return jsonify({ "token": token }), 201
    except Exception:
        current_app.logger.error("Error al crear sensor:\n" + traceback.format_exc())
        db.session.rollback()
        abort(500, description="No se pudo crear el sensor")

@router.route('/<int:sensor_id>', methods=['PUT'])
@usuario_autenticado_requerido
def editar_sensor(sensor_id):
    if not getattr(g.permisos, "puede_editar", False):
        return jsonify({"error": "No tienes permiso para editar sensores"}), 403

    data = request.get_json() or {}

    # Campos que aceptamos actualizar
    nombre        = data.get('nombre')
    descripcion   = data.get('descripcion')
    estado        = data.get('estado')
    inv_id_raw    = data.get('invernadero_id')
    zona_id_raw   = data.get('zona_id')
    parametro_ids = data.get('parametro_ids', [])

    # Validaciones básicas
    if nombre is None or estado is None or inv_id_raw is None:
        abort(400, description="nombre, estado e invernadero_id son obligatorios")

    try:
        invernadero_id = int(inv_id_raw)
    except (TypeError, ValueError):
        abort(400, description="invernadero_id debe ser un entero válido")

    # Validar zona (si viene)
    zona_id = None
    if zona_id_raw not in (None, '', 0):
        try:
            zona_id = int(zona_id_raw)
        except (TypeError, ValueError):
            abort(400, description="zona_id debe ser un entero válido")

    if not isinstance(parametro_ids, list):
        abort(400, description="parametro_ids debe ser una lista")

    # Busca el sensor existente
    sensor = SensorModel.query.get_or_404(sensor_id, description="Sensor no encontrado")

    # Valida existencia de invernadero
    if not InvernaderoModel.query.get(invernadero_id):
        abort(404, description="Invernadero no encontrado")

    # Valida pertenencia de zona
    if zona_id is not None:
        zona = ZonaModel.query.get(zona_id)
        if not zona or zona.invernadero_id != invernadero_id:
            abort(400, description="Zona inválida para ese invernadero")

    # Aplica cambios básicos
    sensor.nombre         = nombre
    sensor.descripcion    = descripcion
    sensor.estado         = estado
    sensor.invernadero_id = invernadero_id
    sensor.zona_id        = zona_id

    # --- Lógica automática de tipo de sensor según número de parámetros ---
    tipo_nombre = "Multiparámetro" if len(parametro_ids) > 1 else "De un parámetro"
    tipo_obj = TipoSensorModel.query.filter_by(nombre=tipo_nombre).first()
    if not tipo_obj:
        abort(500, description=f'Tipo de sensor "{tipo_nombre}" no está configurado')
    sensor.tipo_sensor_id = tipo_obj.id

    # Actualiza parámetros: borra y vuelve a crear
    sensor.parametros.clear()
    for pid in parametro_ids:
        try:
            pid_int = int(pid)
            sp = SensorParametroModel(sensor=sensor, tipo_parametro_id=pid_int)
            sensor.parametros.append(sp)
        except (TypeError, ValueError):
            continue

    try:
        db.session.commit()
        # Formatea la respuesta igual que en listar
        zona = sensor.zona
        inv  = zona.invernadero if zona else None
        params = [{
            "id":       sp.tipo_parametro.id,
            "nombre":   sp.tipo_parametro.nombre,
            "unidad":   getattr(sp.tipo_parametro, "unidad", "")
        } for sp in sensor.parametros]

        return jsonify({
            "id":                sensor.id,
            "nombre":            sensor.nombre,
            "descripcion":       sensor.descripcion,
            "estado":            sensor.estado,
            "fecha_instalacion": sensor.fecha_instalacion.isoformat() if sensor.fecha_instalacion else None,
            "tipo_sensor":       {"id": sensor.tipo_sensor.id, "nombre": sensor.tipo_sensor.nombre},
            "zona":              {"id": zona.id, "nombre": zona.nombre} if zona else None,
            "invernadero":       {"id": inv.id,   "nombre": inv.nombre}   if inv else None,
            "parametros":        params
        }), 200

    except Exception:
        current_app.logger.error("Error editar_sensor:\n" + traceback.format_exc())
        db.session.rollback()
        abort(500, description="No se pudo actualizar el sensor")

@router.route('/<int:sensor_id>', methods=['DELETE'])
@usuario_autenticado_requerido
def eliminar_sensor(sensor_id):
    if not getattr(g.permisos, "puede_eliminar", False):
        return jsonify({"error": "No tienes permiso para eliminar sensores"}), 403
    """
    DELETE /api/sensores/{sensor_id}
    Elimina completamente el sensor (y, gracias al cascade, sus parámetros asociados).
    """
    # 1) Busca o da 404
    sensor = SensorModel.query.get_or_404(sensor_id, description="Sensor no encontrado")

    if sensor.estado != 'Inactivo':
        abort(400, description="El sensor debe estar marcado como 'Inactivo' para poder eliminarlo.")
        
    try:
        # 2) Borra y confirma
        db.session.delete(sensor)
        db.session.commit()
        # 3) 204 No Content al cliente
        return '', 204
    except Exception:
        # 4) Rollback y log de error
        current_app.logger.error("Error eliminar_sensor:\n" + traceback.format_exc())
        db.session.rollback()
        abort(500, description="No se pudo eliminar el sensor")


@router.route('/lecturas', methods=['GET'])
def batch_lecturas():
    try:
        ids_param = request.args.get('ids')
        if ids_param:
            id_list = [i.strip() for i in ids_param.split(',') if i.strip().isdigit()]
        else:
            id_list = [str(s.id) for s in SensorModel.query.with_entities(SensorModel.id).all()]

        if not id_list:
            return jsonify([]), 200

        id_literals = ', '.join(f'"{i}"' for i in id_list)
        flux = f'''
        from(bucket: "temporalSeries_v3")
          |> range(start: -30d)
          |> filter(fn: (r) =>
              r._measurement == "lecturas_sensores" and
              contains(value: r.sensor_id, set: [{id_literals}])
          )
          |> pivot(
              rowKey: ["_time"],
              columnKey: ["_field"],
              valueColumn: "_value"
            )
          |> group(columns: ["sensor_id", "parametro"])
          |> last(column: "valor")
          |> keep(columns: ["sensor_id", "parametro", "valor", "_time"])
        '''
        tables = client.query_api().query(flux)

        resultados = {}
        for table in tables:
            for record in table.records:
                sid = record.values.get('sensor_id')
                if sid not in resultados:
                    resultados[sid] = {"parametros": [], "valores": [], "time": None}
                resultados[sid]["parametros"].append(record.values.get('parametro'))
                resultados[sid]["valores"].append(record.values.get('valor'))
                t   = record.get_time()
                iso = t.isoformat() if t else None
                if not resultados[sid]["time"] or (iso and iso > resultados[sid]["time"]):
                    resultados[sid]["time"] = iso

        salida = [
            {
                "sensor_id":  sid,
                "parametros": data["parametros"],
                "valores":    data["valores"],
                "time":       data["time"]
            }
            for sid, data in resultados.items()
        ]
        return jsonify(salida), 200

    except Exception:
        current_app.logger.error("Error batch_lecturas:\n" + traceback.format_exc())
        return jsonify({ "error": "Error interno al obtener lecturas" }), 500


@router.route('/<int:sensor_id>/ultima-lectura', methods=['GET'])
def ultima_lectura_sensor(sensor_id):
    flux = f'''
    from(bucket: "temporalSeries_v3")
      |> range(start: -30d)
      |> filter(fn: (r) =>
          r._measurement == "lecturas_sensores" and
          r.sensor_id    == "{sensor_id}"
      )
      |> pivot(
          rowKey: ["_time"],
          columnKey: ["_field"],
          valueColumn: "_value"
        )
      |> group(columns: ["parametro"])
      |> last(column: "valor")
      |> keep(columns: ["_time", "parametro", "valor"])
    '''
    tables = client.query_api().query(flux)

    lecturas = []
    for table in tables:
        for record in table.records:
            lecturas.append({
                "parametro": record.values.get("parametro"),
                "valor":      record.values.get("valor"),
                "time":       record.get_time().isoformat() if record.get_time() else None
            })

    parametros  = [l["parametro"] for l in lecturas]
    valores     = [l["valor"]     for l in lecturas]
    times       = [l["time"]      for l in lecturas if l["time"]]
    ultima_time = max(times) if times else None

    return jsonify({
        "parametros": parametros,
        "valores":    valores,
        "time":       ultima_time
    }), 200

@router.route('/por-invernadero/<int:invernadero_id>', methods=['GET'])
def listar_sensores_por_invernadero(invernadero_id):
    try:
        sensores = obtener_sensores_por_invernadero(invernadero_id)
        return jsonify(sensores), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@router.route('/filtro', methods=['GET'])
def listar_sensores_filtrados():
    """
    GET /api/sensores/filtro?invernadero_id=1&tipo_parametro_id=2
    """
    try:
        invernadero_id = request.args.get('invernadero_id', type=int)
        tipo_parametro_id = request.args.get('tipo_parametro_id', type=int)

        if not invernadero_id or not tipo_parametro_id:
            return jsonify({"error": "Faltan parámetros"}), 400

        sensores = obtener_sensores_por_invernadero_y_parametro(invernadero_id, tipo_parametro_id)
        return jsonify(sensores), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@router.route('/datos', methods=['POST'])
def recibir_datos():
    try:
        data       = request.get_json() or {}
        token      = data.get("token")
        mediciones = data.get("mediciones", [])

        sensor = SensorModel.query.filter_by(token=token).first()
        if not sensor:
            abort(401, description="Token de sensor inválido")

        write_api = client.write_api()

        for idx, m in enumerate(mediciones):
            parametro = m.get("parametro")
            valor     = m.get("valor")
            timestamp = m.get("timestamp")
        
            if parametro is None or valor is None:
                continue

            if isinstance(timestamp, str):
                tiempo = datetime.fromisoformat(timestamp)
            elif timestamp is not None:
                tiempo = datetime.fromtimestamp(timestamp, tz=ZoneInfo("America/Santiago"))
            else:
                tiempo = datetime.now(ZoneInfo("America/Santiago"))

            # Añadir microsegundos para evitar colisiones en InfluxDB
            tiempo += timedelta(microseconds=idx)

            point = (
                Point("lecturas_sensores")
                .tag("sensor_id", str(sensor.id))
                .field("valor", float(valor))
                .field("parametro", parametro)
                .time(tiempo)
            )
            write_api.write(bucket="temporalSeries_v3", record=point)

            # Evaluar umbral y generar alerta si corresponde
            tipo_parametro = TipoParametroModel.query.filter_by(nombre=parametro).first()
            if not tipo_parametro:
                continue

            sensor_param = SensorParametroModel.query.filter_by(
                sensor_id=sensor.id,
                tipo_parametro_id=tipo_parametro.id
            ).first()

            if sensor_param:
                evaluar_y_generar_alerta(
                    sensor_parametro_id=sensor_param.id,
                    valor=float(valor),
                    timestamp=datetime.now(ZoneInfo("America/Santiago")) 
                )

        return jsonify({
            "sensor_id":  sensor.id,
            "mediciones": mediciones
        }), 200

    except Exception:
        current_app.logger.error("Error recibir_datos:\n" + traceback.format_exc())
        return jsonify({ "error": "No se pudo procesar los datos" }), 500
    
@router.route('/alertas', methods=['GET'])
def obtener_alertas_activas():
    ids_param = request.args.get('ids')
    if not ids_param:
        return jsonify([]), 200

    try:
        sensor_ids = [int(i) for i in ids_param.split(',') if i.strip().isdigit()]
        from app.models.alerta import Alerta
        from app.models.sensor_parametro import SensorParametro

        # buscar parámetros de esos sensores
        param_ids = (
            db.session.query(SensorParametro.sensor_id, SensorParametro.id)
            .filter(SensorParametro.sensor_id.in_(sensor_ids))
            .all()
        )

        sp_map = {}
        for sid, pid in param_ids:
            sp_map.setdefault(sid, []).append(pid)

        # buscar alertas activas
        alerta_ids = (
            db.session.query(Alerta.sensor_parametro_id)
            .filter(Alerta.estado == 'activo')
            .all()
        )
        alerta_pid_set = {pid for (pid,) in alerta_ids}

        salida = []
        for sid in sensor_ids:
            pids = sp_map.get(sid, [])
            tiene_alerta = any(pid in alerta_pid_set for pid in pids)
            salida.append({ "id": sid, "alerta": tiene_alerta })

        return jsonify(salida), 200
    except Exception as e:
        current_app.logger.error(f"[alertas] error: {e}")
        return jsonify({ "error": "Error al obtener alertas activas" }), 500

@router.route('/validar-token', methods=['POST'])
def validar_token_sensor():
    try:
        data = request.get_json() or {}
        token = data.get("token")
        if not token:
            abort(400, description="Token requerido")

        sensor = SensorModel.query.filter_by(token=token).first()
        if not sensor:
            abort(401, description="Token no válido")

        return jsonify({"valido": True}), 200

    except Exception:
        current_app.logger.error("Error validar_token_sensor:\n" + traceback.format_exc())
        return jsonify({ "error": "No se pudo validar el token" }), 500