from app import db, influx_client as client
from app.models.alerta import Alerta
from app.models.sensor_parametro import SensorParametro
from app.models.sensor import Sensor
from app.models.zona import Zona
from app.models.tipo_parametro import TipoParametro
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
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

    timestamp = timestamp or datetime.utcnow()

    sensor_param = SensorParametro.query.get(sensor_parametro_id)
    if not sensor_param:
        return  # No existe sensor_parametro asociado

    tipo_parametro_id = sensor_param.tipo_parametro_id
    sensor = sensor_param.sensor
    zona = sensor.zona if sensor else None
    invernadero_id = zona.invernadero_id if zona else None

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
        nivel_alerta = "critico"
    elif valor < umbral.advertencia_min or valor > umbral.advertencia_max:
        nivel_alerta = "advertencia"

    if not nivel_alerta:
        return
    
    # Verificar si ya hay una alerta activa del mismo tipo y nivel
    ya_alertada = Alerta.query.filter_by(
        sensor_parametro_id=sensor_parametro_id,
        tipo="umbral",
        nivel=nivel_alerta,
        estado="activo"
    ).first()

    if ya_alertada:
        return  # Ya hay una alerta activa, no duplicar

    # Crear la alerta
    parametro = TipoParametro.query.get(tipo_parametro_id)
    mensaje = f"El valor {valor} de {parametro.nombre} ({parametro.unidad}) excede el umbral {nivel_alerta.upper()}."

    alerta = Alerta(
        sensor_parametro_id=sensor_parametro_id,
        tipo="umbral",
        mensaje=mensaje,
        valor_detectado=valor,
        fecha_hora=timestamp,
        nivel=nivel_alerta,
        estado="activo"
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
            .joinedload(SensorParametro.tipo_parametro)
    )

    if filtros.get("estado"):
        query = query.filter(Alerta.estado == filtros["estado"])
    if filtros.get("nivel"):
        query = query.filter(Alerta.nivel == filtros["nivel"])
    if filtros.get("invernadero_id"):
        query = query.join(Alerta.sensor_parametro).join(SensorParametro.sensor).join(Sensor.zona).filter(Zona.invernadero_id == filtros["invernadero_id"])
    if filtros.get("zona_id"):
        query = query.join(Alerta.sensor_parametro).join(SensorParametro.sensor).filter(Sensor.zona_id == filtros["zona_id"])
    if filtros.get("busqueda"):
        query = query.join(Alerta.sensor_parametro).join(SensorParametro.tipo_parametro).filter(
            TipoParametro.nombre.ilike(f"%{filtros['busqueda']}%")
        )

    paginated = query.order_by(Alerta.fecha_hora.desc()).paginate(page=page, per_page=per_page)

    return {
        "data": [
            {
                "id": a.id,
                "sensor_parametro_id": a.sensor_parametro_id,
                "nivel": a.nivel,
                "tipo": a.tipo,
                "mensaje": a.mensaje,
                "valor_detectado": float(a.valor_detectado),
                "fecha_hora": a.fecha_hora.isoformat(),
                "estado": a.estado
            } for a in paginated.items
        ],
        "pagination": {
            "page": paginated.page,
            "pages": paginated.pages,
            "per_page": paginated.per_page,
            "total": paginated.total
        }
    }

def verificar_sensores_desconectados(minutos: int = 5):
    """
    Recorre todos los sensores y verifica si alguno no ha enviado datos
    a InfluxDB en los últimos `minutos`. Si es así, se genera una alerta de tipo 'error'.
    """
    ahora = datetime.utcnow()
    sensores = Sensor.query.all()
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
            .filter_by(sensor_parametro_id=None, tipo="error", estado="activo")
            .filter(Alerta.mensaje.like(f"%{sensor.nombre}%"))
            .first()
        )

        if not ya_alertado:
            alerta = Alerta(
                sensor_parametro_id=None,
                tipo="error",
                nivel="critico",
                mensaje=f"El sensor '{sensor.nombre}' no ha enviado datos en los últimos {minutos} minutos.",
                valor_detectado=0,
                fecha_hora=ahora,
                estado="activo"
            )
            db.session.add(alerta)

    db.session.commit()
    print(f"[INFO] Sensores inactivos detectados: {len(sensores_inactivos)}")

def iniciar_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=verificar_sensores_desconectados,
        trigger='interval',
        minutes=5,
        id='verificacion_sensores',
        replace_existing=True
    )
    scheduler.start()
    print("[SCHEDULER] Verificación de sensores desconectados cada 5 minutos iniciada.")
