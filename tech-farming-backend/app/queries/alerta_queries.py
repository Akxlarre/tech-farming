from zoneinfo import ZoneInfo
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
    
    # Verificar si ya hay una alerta activa del mismo tipo y nivel
    ya_alertada = Alerta.query.filter_by(
        sensor_parametro_id=sensor_parametro_id,
        tipo="Umbral",
        nivel=nivel_alerta,
        estado="Activa"
    ).first()
    if ya_alertada:
        return  # Ya hay una alerta activa, no duplicar

    # Crear la alerta
    parametro = TipoParametro.query.get(tipo_parametro_id)
    mensaje = f"El valor {valor} de {parametro.nombre} ({parametro.unidad}) excede el umbral {nivel_alerta.upper()}."

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

    usuarios_a_notificar = Usuario.query.filter(Usuario.telefono.isnot(None)).all()
    for u in usuarios_a_notificar:
        try:
            telefono = u.telefono.strip()
            enviar_whatsapp(mensaje_whatsapp, f"whatsapp:{telefono}")
        except Exception as e:
            print(f"[WHATSAPP] Error enviando mensaje a {u.nombre}: {e}")


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
