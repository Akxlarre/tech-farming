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

    # Filtro por "ambito"
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
            "umbral_min": float(u.umbral_min) if u.umbral_min else None,
            "umbral_max": float(u.umbral_max) if u.umbral_max else None,
            "advertencia_min": float(u.advertencia_min) if u.advertencia_min else None,
            "advertencia_max": float(u.advertencia_max) if u.advertencia_max else None,
            "critico_min": float(u.critico_min) if u.critico_min else None,
            "critico_max": float(u.critico_max) if u.critico_max else None,
            "activo": u.activo
        }
        for u in resultados
    ]
