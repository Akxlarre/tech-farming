from app import db
from app.models.configuracion_umbral import ConfiguracionUmbral

def listar_umbrales(filtros):
    from app.models.tipo_parametro import TipoParametro
    from app.models.sensor import Sensor
    from app.models.invernadero import Invernadero
    from app.models.sensor_parametro import SensorParametro

    query = ConfiguracionUmbral.query

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

    query = query.filter(ConfiguracionUmbral.activo == True)
    resultados = query.all()
    data = []
    
    for u in resultados:
        tipo_parametro = TipoParametro.query.get(u.tipo_parametro_id) if u.tipo_parametro_id else None
        invernadero = Invernadero.query.get(u.invernadero_id) if u.invernadero_id else None

        sensor_nombre = None
        sensor_invernadero_nombre = None
        if u.sensor_parametro_id:
            sensor_param = SensorParametro.query.get(u.sensor_parametro_id)
            if sensor_param:
                sensor = Sensor.query.get(sensor_param.sensor_id)
                sensor_nombre = sensor.nombre if sensor else None
                if sensor and sensor.zona:
                    sensor_invernadero_nombre = sensor.zona.invernadero.nombre

        
        print(f"[DEBUG] ID umbral: {u.id} | tipo_parametro_id: {u.tipo_parametro_id} → {tipo_parametro.nombre if tipo_parametro else 'NULO'}")
        data.append({
            "id": u.id,
            "tipo_parametro_id": u.tipo_parametro_id,
            "tipo_parametro_nombre": tipo_parametro.nombre if tipo_parametro else None,
            "tipo_parametro_unidad": tipo_parametro.unidad if tipo_parametro else None,
            "invernadero_id": u.invernadero_id,
            "invernadero_nombre": invernadero.nombre if invernadero else None,
            "sensor_parametro_id": u.sensor_parametro_id,
            "sensor_nombre": sensor_nombre,
            "sensor_invernadero_nombre": sensor_invernadero_nombre,
            "advertencia_min": float(u.advertencia_min) if u.advertencia_min else None,
            "advertencia_max": float(u.advertencia_max) if u.advertencia_max else None,
            "critico_min": float(u.critico_min) if u.critico_min else None,
            "critico_max": float(u.critico_max) if u.critico_max else None,
            "activo": u.activo
        })
    return data

def crear_umbral(data):
    try:
        if not data.get("tipo_parametro_id"):
            return {"error": "El campo tipo_parametro_id es obligatorio"}

        nuevo_umbral = ConfiguracionUmbral(
            tipo_parametro_id = data.get("tipo_parametro_id"),
            invernadero_id = data.get("invernadero_id"),
            sensor_parametro_id = data.get("sensor_parametro_id"),
            advertencia_min = data.get("advertencia_min"),
            advertencia_max = data.get("advertencia_max"),
            critico_min = data.get("critico_min"),
            critico_max = data.get("critico_max"),
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

        # Actualizar campos si vienen en el JSON
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


