# app/queries/prediction_queries.py

from typing import Optional, Dict, Any
from influxdb_client import QueryApi
from app.models.sensor import Sensor as SensorModel
from app.models.zona   import Zona   as ZonaModel
import dateutil.parser

def obtener_serie_prediccion(
    query_api: QueryApi,
    bucket: str,
    org: str,
    invernadero_id: int,
    tipo_parametro: str,
    desde: str,
    hasta: str,
    zona_id: Optional[int] = None,
    sensor_id: Optional[int] = None,
    window_every: str = "1h"
) -> Dict[str, Any]:
    """
    Recupera la serie horaria promedio de todos los sensores que midan
    `tipo_parametro`, filtrando por invernadero, zona o sensor, y
    usando pivot → aggregateWindow → group para un único punto por hora.
    Incluye logs de depuración.
    """
    # 1) IDs de sensores: sensor > zona > invernadero
    if sensor_id is not None:
        ids = [sensor_id]
    else:
        q = SensorModel.query
        if zona_id is not None:
            q = q.filter_by(zona_id=zona_id)
        else:
            q = q.join(ZonaModel).filter(ZonaModel.invernadero_id == invernadero_id)
        ids = [row[0] for row in q.with_entities(SensorModel.id).all()]

    # Debug: lista de sensores usada
    print(f"🐞 [pred] IDs sensores (invernadero_id={invernadero_id}, zona_id={zona_id}): {ids}")

    if not ids:
        return {"series": [], "stats": {"promedio": 0, "minimo": None, "maximo": None, "desviacion": 0}}

    # 2) Construir script Flux
    lista = ",".join(f'"{sid}"' for sid in ids)
    flux = f'''
from(bucket: "{bucket}")
  |> range(start: {desde}, stop: {hasta})

  |> filter(fn: (r) =>
       r._measurement == "lecturas_sensores" and
       (r._field == "valor" or r._field == "parametro")
     )

  |> pivot(
       rowKey:      ["_time","sensor_id"],
       columnKey:   ["_field"],
       valueColumn: "_value"
     )

  |> filter(fn: (r) =>
       contains(value: r.sensor_id, set: [{lista}]) and
       r.parametro == "{tipo_parametro}"
     )

  |> aggregateWindow(every: {window_every}, fn: mean, column: "valor")

  |> group(columns: ["_time"])
  |> yield(name: "serie")
'''
    # Debug: muestra el Flux que se enviará
    print("🐞 [pred] Flux query:")
    print(flux)

    # 3) Ejecutar consulta Flux y parsear resultados
    tables = query_api.query(flux, org=org)
    series = []
    for table in tables:
        for rec in table.records:
            val = rec.values.get("valor")
            if val is None:
                continue
            series.append({
                "timestamp": rec.get_time().isoformat(),
                "value":     float(val)
            })

    # Debug: cuántos puntos devolvió InfluxDB y muestra la lista
    print(f"🐞 [pred] Series obtenidas ({len(series)} puntos): {series}")

    # 4) Calcular estadísticas básicas sobre la serie
    if series:
        vals  = [p["value"] for p in series]
        times = [dateutil.parser.isoparse(p["timestamp"]) for p in series]
        n     = len(vals)
        mean  = sum(vals) / n
        idx_min = min(range(n), key=lambda i: vals[i])
        idx_max = max(range(n), key=lambda i: vals[i])
        var    = sum((v - mean)**2 for v in vals) / n
        std    = var**0.5
        stats = {
            "promedio":   mean,
            "minimo":     {"value": vals[idx_min], "fecha": times[idx_min].isoformat()},
            "maximo":     {"value": vals[idx_max], "fecha": times[idx_max].isoformat()},
            "desviacion": std
        }
    else:
        stats = {"promedio": 0, "minimo": None, "maximo": None, "desviacion": 0}

    return {"series": series, "stats": stats}
