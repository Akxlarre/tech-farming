from app import db
from app.models.configuracion_umbral import ConfiguracionUmbral

def listar_umbrales(filtros):
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
        query = query.filter(ConfiguracionUmbral.invernadero_id.isnot(None))
    elif ambito == "sensor":
        query = query.filter(ConfiguracionUmbral.sensor_parametro_id.isnot(None))

    resultados = query.all()

    return [
        {
            "id": u.id,
            "tipo_parametro_id": u.tipo_parametro_id,
            "invernadero_id": u.invernadero_id,
            "sensor_parametro_id": u.sensor_parametro_id,
            "advertencia_min": float(u.advertencia_min) if u.advertencia_min else None,
            "advertencia_max": float(u.advertencia_max) if u.advertencia_max else None,
            "critico_min": float(u.critico_min) if u.critico_min else None,
            "critico_max": float(u.critico_max) if u.critico_max else None,
            "activo": u.activo
        }
        for u in resultados
    ]

def crear_umbral(data):
    try:
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


