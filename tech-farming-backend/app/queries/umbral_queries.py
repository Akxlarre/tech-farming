from app import db
from app.models.configuracion_umbral import ConfiguracionUmbral
from app.models.zona import Zona
from sqlalchemy.orm import joinedload

def listar_umbrales(filtros):
    from app.models.tipo_parametro import TipoParametro
    from app.models.sensor import Sensor
    from app.models.invernadero import Invernadero
    from app.models.sensor_parametro import SensorParametro

    page     = filtros.get("page", 1)
    per_page = filtros.get("perPage", 10)

    query = ConfiguracionUmbral.query.options(
        joinedload(ConfiguracionUmbral.tipo_parametro),
        joinedload(ConfiguracionUmbral.invernadero),
        joinedload(ConfiguracionUmbral.sensor_parametro)
            .joinedload(SensorParametro.sensor)
            .joinedload(Sensor.zona)
            .joinedload(Zona.invernadero)
    )
    query = query.filter(ConfiguracionUmbral.activo.is_(True))

    ambito = filtros.get("ambito")
    tipo_parametro_id = filtros.get("tipo_parametro_id")
    invernadero_id = filtros.get("invernadero_id")
    sensor_parametro_id = filtros.get("sensor_parametro_id")

    if tipo_parametro_id:
        query = query.filter(ConfiguracionUmbral.tipo_parametro_id == tipo_parametro_id)
    if invernadero_id:
        query = query.filter(ConfiguracionUmbral.invernadero_id == invernadero_id)
    if sensor_parametro_id:
        query = query.filter(ConfiguracionUmbral.sensor_parametro_id == sensor_parametro_id)

    # Filtro por ambito (global, invernadero, sensor)
    if ambito == "global":
        query = query.filter(
            ConfiguracionUmbral.tipo_parametro_id.isnot(None),
            ConfiguracionUmbral.invernadero_id.is_(None),
            ConfiguracionUmbral.sensor_parametro_id.is_(None)
        )
    elif ambito == "invernadero":
        query = query.filter(
            ConfiguracionUmbral.invernadero_id.isnot(None),
            ConfiguracionUmbral.sensor_parametro_id.is_(None))
    elif ambito == "sensor":
        query = query.filter(ConfiguracionUmbral.sensor_parametro_id.isnot(None))

    query = query.join(TipoParametro, ConfiguracionUmbral.tipo_parametro_id == TipoParametro.id)
    paginated = query.order_by(TipoParametro.nombre.asc()).paginate(page=page, per_page=per_page, error_out=False)
    
    return {
        "data": [
            {
                "id": u.id,
                "tipo_parametro_id": u.tipo_parametro_id,
                "tipo_parametro_nombre": u.tipo_parametro.nombre if u.tipo_parametro else None,
                "tipo_parametro_unidad": u.tipo_parametro.unidad if u.tipo_parametro else None,
                "invernadero_id": u.invernadero_id,
                "invernadero_nombre": u.invernadero.nombre if u.invernadero else None,
                "sensor_parametro_id": u.sensor_parametro_id,
                "sensor_nombre": (
                    u.sensor_parametro.sensor.nombre if u.sensor_parametro and u.sensor_parametro.sensor else None
                ),
                "sensor_invernadero_nombre": (
                    u.sensor_parametro.sensor.zona.invernadero.nombre
                    if u.sensor_parametro and u.sensor_parametro.sensor and u.sensor_parametro.sensor.zona and u.sensor_parametro.sensor.zona.invernadero
                    else None
                ),
                "advertencia_min": float(u.advertencia_min) if u.advertencia_min is not None else None,
                "advertencia_max": float(u.advertencia_max) if u.advertencia_max is not None else None,
                "critico_min": float(u.critico_min) if u.critico_min is not None else None,
                "critico_max": float(u.critico_max) if u.critico_max is not None else None,
                "activo": u.activo
            } for u in paginated.items
        ],
        "pagination": {
            "page": paginated.page,
            "pages": paginated.pages,
            "per_page": paginated.per_page,
            "total": paginated.total
        }
    }

def crear_umbral(data):
    try:
        if not data.get("tipo_parametro_id"):
            return {"error": "El campo tipo_parametro_id es obligatorio"}
        
        # Validaciones de rangos
        adv_min = data.get("advertencia_min")
        adv_max = data.get("advertencia_max")
        crit_min = data.get("critico_min")
        crit_max = data.get("critico_max")

        if adv_min is None or adv_max is None:
            return {"error": "Debe proporcionar advertencia_min y advertencia_max"}

        if adv_min >= adv_max:
            return {"error": "advertencia_min debe ser menor que advertencia_max"}

        if crit_min is not None and crit_min >= adv_min:
            return {"error": "critico_min debe ser menor que advertencia_min"}

        if crit_max is not None and adv_max >= crit_max:
            return {"error": "advertencia_max debe ser menor que critico_max"}

        if crit_min is not None and crit_max is not None and crit_min >= crit_max:
            return {"error": "critico_min debe ser menor que critico_max"}
        
        nuevo_umbral = ConfiguracionUmbral(
            tipo_parametro_id = data.get("tipo_parametro_id"),
            invernadero_id = data.get("invernadero_id"),
            sensor_parametro_id = data.get("sensor_parametro_id"),
            advertencia_min = adv_min,
            advertencia_max = adv_max,
            critico_min = crit_min,
            critico_max = crit_max,
            activo = True
        )
        db.session.add(nuevo_umbral)
        db.session.commit()

        return {
            "id": nuevo_umbral.id,
            "mensaje": "Umbral creado exitosamente"
        }
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] al crear umbral: {e}")
        return {"error": str(e)}
    
def actualizar_umbral(umbral_id, data):
    try:
        umbral = ConfiguracionUmbral.query.get(umbral_id)
        if not umbral:
            return {"error": "Umbral no encontrado"}
        if "tipo_parametro_id" in data and data["tipo_parametro_id"] is None:
            return {"error": "tipo_parametro_id no puede ser nulo"}
        
        adv_min = data.get("advertencia_min", umbral.advertencia_min)
        adv_max = data.get("advertencia_max", umbral.advertencia_max)
        crit_min = data.get("critico_min", umbral.critico_min)
        crit_max = data.get("critico_max", umbral.critico_max)

        if adv_min is None or adv_max is None:
            return {"error": "Debe proporcionar advertencia_min y advertencia_max"}

        if adv_min >= adv_max:
            return {"error": "advertencia_min debe ser menor que advertencia_max"}

        if crit_min is not None and crit_min >= adv_min:
            return {"error": "critico_min debe ser menor que advertencia_min"}

        if crit_max is not None and adv_max >= crit_max:
            return {"error": "advertencia_max debe ser menor que critico_max"}

        if crit_min is not None and crit_max is not None and crit_min >= crit_max:
            return {"error": "critico_min debe ser menor que critico_max"}

        # Actualizar campos
        umbral.tipo_parametro_id = data.get("tipo_parametro_id", umbral.tipo_parametro_id)
        umbral.invernadero_id = data.get("invernadero_id", umbral.invernadero_id)
        umbral.sensor_parametro_id = data.get("sensor_parametro_id", umbral.sensor_parametro_id)
        umbral.advertencia_min = data.get("advertencia_min", umbral.advertencia_min)
        umbral.advertencia_max = data.get("advertencia_max", umbral.advertencia_max)
        umbral.critico_min = data.get("critico_min", umbral.critico_min)
        umbral.critico_max = data.get("critico_max", umbral.critico_max)

        db.session.commit()

        return {"mensaje": "Umbral actualizado correctamente"}
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] al actualizar umbral: {e}")
        return {"error": str(e)}
    
def eliminar_umbral(umbral_id):
    try:
        umbral = ConfiguracionUmbral.query.get(umbral_id)
        if not umbral:
            return {"error": "Umbral no encontrado"}

        umbral.activo = False
        db.session.commit()

        return {"mensaje": "Umbral desactivado correctamente"}
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] al eliminar umbral: {e}")
        return {"error": str(e)}


