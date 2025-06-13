from sqlalchemy import and_, not_, or_
from app import db, influx_client as client
from app.models.alerta import Alerta
from app.models.sensor_parametro import SensorParametro
from app.models.sensor import Sensor
from app.models.zona import Zona
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import joinedload
from zoneinfo import ZoneInfo

def evaluar_y_generar_alerta(sensor_parametro_id: int, valor: float, timestamp: Optional[datetime] = None):
    """
    Evalúa un valor leído desde un sensor contra los umbrales configurados y,
    si corresponde, genera una alerta.

    Parámetros:
    - sensor_parametro_id: ID del sensor_parametro al que corresponde la lectura.
    - valor: Valor recibido desde InfluxDB.
    - timestamp: Fecha y hora de la lectura (opcional, por defecto now).
    """
    from app import db
    from app.models.alerta import Alerta
    from app.models.sensor_parametro import SensorParametro
    from app.models.configuracion_umbral import ConfiguracionUmbral
    from app.models.tipo_parametro import TipoParametro
    from app.models.usuario import Usuario
    from app.utils.whatsapp_notifier import enviar_whatsapp

    timestamp = timestamp or datetime.now(ZoneInfo("America/Santiago"))

    frecuencia_alertas_min = 5     # Generar nueva alerta solo cada 5 min si sigue activa
    cooldown_post_resolucion_min = 30  # Esperar 1h después de resolverse para volver a generar

    sensor_param = SensorParametro.query.get(sensor_parametro_id)
    if not sensor_param:
        return  # No existe sensor_parametro asociado

    tipo_parametro_id = sensor_param.tipo_parametro_id
    sensor = sensor_param.sensor
    zona = sensor.zona if sensor else None
    invernadero_id = zona.invernadero_id if zona else None
    invernadero_nombre = zona.invernadero.nombre if zona and zona.invernadero else None

    # Buscar el umbral más específico disponible (prioridad descendente)
    umbral = ConfiguracionUmbral.query.filter_by(
        sensor_parametro_id=sensor_parametro_id,
        activo=True
    ).first()

    if not umbral and invernadero_id:
        umbral = ConfiguracionUmbral.query.filter_by(
            invernadero_id=invernadero_id,
            tipo_parametro_id=tipo_parametro_id,
            sensor_parametro_id=None,
            activo=True
        ).first()

    if not umbral:
        umbral = ConfiguracionUmbral.query.filter_by(
            tipo_parametro_id=tipo_parametro_id,
            invernadero_id=None,
            sensor_parametro_id=None,
            activo=True
        ).first()
    if not umbral:
        return  # No hay umbral aplicable definido

    # Evaluar contra umbrales críticos y de advertencia
    nivel_alerta = None
    if umbral.critico_min is not None and valor < umbral.critico_min or umbral.critico_max is not None and valor > umbral.critico_max:
        nivel_alerta = "Crítico"
    elif valor < umbral.advertencia_min or valor > umbral.advertencia_max:
        nivel_alerta = "Advertencia"
    if not nivel_alerta:
        return
    
    # Buscar última alerta del mismo sensor/param
    alerta_antigua = (
        Alerta.query
        .filter_by(sensor_parametro_id=sensor_parametro_id, tipo="Umbral", nivel=nivel_alerta)
        .order_by(Alerta.fecha_hora.desc())
        .first()
    )

    if alerta_antigua:
        print(f"[ALERT DEBUG] Última alerta encontrada: ID {alerta_antigua.id} ({alerta_antigua.estado})")
        if alerta_antigua.estado == "Resuelta":
            fecha_res = alerta_antigua.fecha_resolucion
            if fecha_res and fecha_res.tzinfo is None:
                fecha_res = fecha_res.replace(tzinfo=timezone.utc).astimezone(ZoneInfo("America/Santiago"))
            if fecha_res:
                minutos = (timestamp - fecha_res).total_seconds() / 60
                print(f"[ALERT DEBUG] Última alerta resuelta: {alerta_antigua.id}")
                print(f"[ALERT DEBUG] Tiempo desde resolución: {minutos:.2f} minutos")
                print(f"[ALERT DEBUG] Cooldown permitido: {cooldown_post_resolucion_min} minutos")
                if minutos < cooldown_post_resolucion_min:
                    print("[ALERT DEBUG] ❌ No se genera alerta: aún en cooldown post resolución")
                    return
        else:
            fecha_alerta = alerta_antigua.fecha_hora
            if fecha_alerta:
                print(f"[ALERTA DEBUG] Última alerta activa encontrada: ID {alerta_antigua.id}")
                print(f"[ALERTA DEBUG] Fecha alerta activa: {fecha_alerta.isoformat()}")
                if fecha_alerta.tzinfo is None:
                    print("[ALERTA DEBUG] Fecha sin tzinfo, asignando America/Santiago")
                    fecha_alerta = fecha_alerta.replace(tzinfo=timezone.utc).astimezone(ZoneInfo("America/Santiago"))

                minutos_transcurridos = (timestamp - fecha_alerta).total_seconds() / 60
                print(f"[ALERTA DEBUG] Minutos desde última alerta activa: {minutos_transcurridos:.2f}")
                print(f"[ALERTA DEBUG] Frecuencia mínima requerida: {frecuencia_alertas_min} minutos")

                if minutos_transcurridos < frecuencia_alertas_min:
                    print("[ALERTA DEBUG] No se generará nueva alerta aún (frecuencia mínima no cumplida)")
                    return  # Aún no han pasado los minutos requeridos
    else:
        print("[ALERT DEBUG] No se encontró ninguna alerta previa: se permitirá generar nueva alerta.")

    # Mensaje de alerta
    parametro = TipoParametro.query.get(tipo_parametro_id)
    mensaje = f"El valor {valor} de {parametro.nombre} ({parametro.unidad}) excede el umbral {nivel_alerta.upper()}."
    # Mensaje para WhatsApp
    hora_lectura = timestamp.strftime("%d/%m/%Y %H:%M:%S")
    sensor_nombre = sensor.nombre if sensor else "Desconocido"
    zona_nombre = zona.nombre if zona else "Zona desconocida"
    invernadero = invernadero_nombre or "Invernadero desconocido"
    mensaje_whatsapp = (
        f"🚨 *ALERTA {nivel_alerta.upper()}*\n"
        f"{mensaje}\n\n"
        f"📍 Sensor: {sensor_nombre}\n"
        f"📦 Zona: {zona_nombre}\n"
        f"🏡 Invernadero: {invernadero}\n"
        f"⏰ Fecha y hora: {hora_lectura}"
    )

    # --- Lógica de envío WhatsApp ---
    usuarios_a_notificar = Usuario.query.filter(Usuario.telefono.isnot(None)).all()
    for u in usuarios_a_notificar:
        if not u.recibe_notificaciones:
            print(f"[WHATSAPP DEBUG] Usuario {u.nombre} tiene notificaciones desactivadas")
            continue

        print(f"[WHATSAPP DEBUG] Evaluando usuario: {u.nombre}")

        alerta_antigua = (
            Alerta.query
            .filter_by(sensor_parametro_id=sensor_parametro_id, tipo="Umbral")
            .order_by(Alerta.fecha_hora.desc())
            .first()
        )

        enviar = True

        if alerta_antigua:
            print(f"[WHATSAPP DEBUG] Última alerta encontrada: {alerta_antigua.id} ({alerta_antigua.estado})")
            if alerta_antigua.estado == "Resuelta":
                if alerta_antigua.fecha_resolucion:
                    fecha_res = alerta_antigua.fecha_resolucion
                    if fecha_res.tzinfo is None:
                        print(f"[WHATSAPP DEBUG] Fecha resolución sin tzinfo, asumiendo UTC")
                        fecha_res = fecha_res.replace(tzinfo=timezone.utc).astimezone(ZoneInfo("America/Santiago"))

                    delta = (timestamp - fecha_res).total_seconds() / 60
                    print(f"[WHATSAPP DEBUG] Tiempo desde resolución: {delta:.2f} minutos")
                    print(f"[WHATSAPP DEBUG] Cooldown permitido: {u.cooldown_post_resolucion} minutos")

                    if delta < u.cooldown_post_resolucion:
                        print(f"[WHATSAPP DEBUG] Dentro del cooldown post resolución. No se enviará a {u.nombre}")
                        enviar = False
            else:
                fecha_ant = alerta_antigua.fecha_hora
                if fecha_ant.tzinfo is None:
                    print(f"[WHATSAPP DEBUG] Fecha alerta activa sin tzinfo, asumiendo UTC")
                    fecha_ant = fecha_ant.replace(tzinfo=timezone.utc).astimezone(ZoneInfo("America/Santiago"))

                delta = (timestamp - fecha_ant).total_seconds() / 60
                print(f"[WHATSAPP DEBUG] Tiempo desde alerta activa: {delta:.2f} minutos")
                print(f"[WHATSAPP DEBUG] Frecuencia permitida: {u.alertas_cada_minutos} minutos")

                if delta < u.alertas_cada_minutos:
                    print(f"[WHATSAPP DEBUG] No ha pasado el tiempo suficiente para notificar a {u.nombre}")
                    enviar = False

        if enviar:
            try:
                telefono = u.telefono.strip()
                print(f"[WHATSAPP] Enviando mensaje a {telefono} ({u.nombre})...\n{mensaje_whatsapp}")
                enviar_whatsapp(mensaje_whatsapp, f"whatsapp:{telefono}")
            except Exception as e:
                print(f"[WHATSAPP] Error enviando mensaje a {u.nombre}: {e}")
        else:
            print(f"[WHATSAPP DEBUG] Mensaje a {u.nombre} no enviado por reglas de frecuencia o cooldown.\n")

    # Crear alerta
    alerta = Alerta(
        sensor_id=sensor.id,
        sensor_parametro_id=sensor_parametro_id,
        tipo="Umbral",
        mensaje=mensaje,
        valor_detectado=valor,
        fecha_hora=timestamp,
        nivel=nivel_alerta,
        estado="Activa"
    )
    db.session.add(alerta)
    db.session.commit()

def listar_alertas(filtros: dict):
    page     = filtros.get("page", 1)
    per_page = filtros.get("perPage", 20)

    query = Alerta.query.options(
        joinedload(Alerta.sensor_parametro)
            .joinedload(SensorParametro.sensor)
            .joinedload(Sensor.zona),
        joinedload(Alerta.sensor_parametro)
            .joinedload(SensorParametro.tipo_parametro),
        joinedload(Alerta.sensor)
            .joinedload(Sensor.zona),
        joinedload(Alerta.usuario_resolutor)
    )

    if filtros.get("estado"):
        query = query.filter(Alerta.estado == filtros["estado"])
    if filtros.get("nivel"):
        query = query.filter(Alerta.nivel == filtros["nivel"])
    if filtros.get("invernadero_id"):
        query = query.filter(or_(
            Alerta.sensor_parametro.has(
                SensorParametro.sensor.has(
                    Sensor.zona.has(Zona.invernadero_id == filtros["invernadero_id"])
                )
            ),
            Alerta.sensor.has(
                Sensor.zona.has(Zona.invernadero_id == filtros["invernadero_id"])
            )
        ))
        query = query.filter(
            not_(
                and_(
                    Alerta.tipo == 'umbral',
                    Alerta.sensor_parametro_id.is_(None)
                )
            )
        )
    if filtros.get("zona_id"):
        query = query.filter(or_(
            Alerta.sensor_parametro.has(
                SensorParametro.sensor.has(Sensor.zona_id == filtros["zona_id"])
            ),
            Alerta.sensor.has(Sensor.zona_id == filtros["zona_id"])
        ))
    if filtros.get("sensor_id"):
        sid = filtros["sensor_id"]
        query = query.filter(or_(
            Alerta.sensor_id == sid,
            and_(
                Alerta.sensor_id.is_(None),
                Alerta.sensor_parametro.has(
                    SensorParametro.sensor_id == sid
                )
            )
        ))

    paginated = query.order_by(Alerta.fecha_hora.desc()).paginate(page=page, per_page=per_page)

    return {
        "data": [
            {
                "id": a.id,
                "sensor_parametro_id": a.sensor_parametro_id,
                "tipo_parametro": (
                    a.sensor_parametro.tipo_parametro.nombre if a.sensor_parametro and a.sensor_parametro.tipo_parametro else None
                ),
                "sensor_nombre": (
                    a.sensor.nombre if a.sensor else (
                        a.sensor_parametro.sensor.nombre if a.sensor_parametro and a.sensor_parametro.sensor else None
                    )
                ),
                "nivel": a.nivel,
                "tipo": a.tipo,
                "mensaje": a.mensaje,
                "valor_detectado": float(a.valor_detectado) if a.valor_detectado is not None else None,
                "fecha_hora": (
                    a.fecha_hora.replace(tzinfo=timezone.utc)
                    .astimezone(ZoneInfo("America/Santiago"))
                    .isoformat()
        ),
                "estado": a.estado,
                "resuelta_por": f"{a.usuario_resolutor.nombre} {a.usuario_resolutor.apellido}" if a.usuario_resolutor else None
            } for a in paginated.items
        ],
        "pagination": {
            "page": paginated.page,
            "pages": paginated.pages,
            "per_page": paginated.per_page,
            "total": paginated.total
        }
    }

def verificar_sensores_desconectados(app, minutos: int = 10):
    """
    Recorre todos los sensores y verifica si alguno no ha enviado datos
    a InfluxDB en los últimos `minutos`. Si es así, se genera una alerta de tipo 'Error'.
    """
    with app.app_context():

        ahora = datetime.utcnow()
        sensores = Sensor.query.filter_by(estado="Activo").all()
        sensores_inactivos = []

        for sensor in sensores:
            flux = f'''
            from(bucket: "temporalSeries_v3")
            |> range(start: -{minutos}m)
            |> filter(fn: (r) =>
                r._measurement == "lecturas_sensores" and
                r.sensor_id    == "{sensor.id}"
            )
            |> keep(columns: ["_time"])
            |> sort(columns: ["_time"], desc: true)
            |> limit(n:1)
            '''
            tables = client.query_api().query(flux)
            ultima_lectura = None

            for table in tables:
                for record in table.records:
                    ultima_lectura = record.get_time()
                    break

            if not ultima_lectura:
                sensores_inactivos.append(sensor)

        # Crear alertas para sensores desconectados
        for sensor in sensores_inactivos:
            ya_alertado = (
                Alerta.query
                .filter_by(sensor_id=sensor.id, tipo="Error", estado="Activa")
                .first()
            )

            if not ya_alertado:
                alerta = Alerta(
                    sensor_id=sensor.id,
                    sensor_parametro_id=None,
                    tipo="Error",
                    nivel="Crítico",
                    mensaje=f"El sensor '{sensor.nombre}' no ha enviado datos en los últimos {minutos} minutos.",
                    valor_detectado=None,
                    fecha_hora=ahora,
                    estado="Activa"
                )
                db.session.add(alerta)

        db.session.commit()

def iniciar_scheduler(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=lambda: verificar_sensores_desconectados(app),
        trigger='interval',
        minutes=10,
        id='verificacion_sensores',
        replace_existing=True
    )
    scheduler.start()
    print("[SCHEDULER] Verificación de sensores desconectados cada 10 minutos iniciada.")
