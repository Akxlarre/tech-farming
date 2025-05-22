# app/queries/historial_queries.py

from typing import Optional, Dict, Any
from influxdb_client import QueryApi
from app.models.sensor import Sensor as SensorModel
from app.models.zona import Zona as ZonaModel
import dateutil.parser

def obtener_historial(
    query_api:     QueryApi,
    bucket:        str,
    org:           str,
    invernadero_id: int,
    tipo_parametro: str,
    desde:          str,
    hasta:          str,
    zona_id:        Optional[int] = None,
    sensor_id:      Optional[int] = None,
    window_every:   str = "1h"
) -> Dict[str, Any]:
    """
    1) Obtiene sólo los IDs de sensores según invernadero/zona/sensor.
    2) Filtra en Flux por esos sensor_id, parametro y rango de tiempo.
    3) Devuelve series y stats.
    """

    # 1) Cálculo de sensor_ids (solo ID para evitar columnas faltantes)
    if sensor_id:
        ids = [sensor_id]
    else:
        q = SensorModel.query
        if zona_id is not None:
            q = q.filter_by(zona_id=zona_id)
        else:
            q = q.join(ZonaModel).filter(ZonaModel.invernadero_id == invernadero_id)
        # Traemos solo el campo id:
        ids = [row[0] for row in q.with_entities(SensorModel.id).all()]

    # ——— DEBUG-REL: qué IDs enteros devolvió SQL ———
    print(f"[DEBUG-REL] Sensor IDs (enteros) desde SQL: {ids}")

    if not ids:
        return {
            "series": [],
            "stats": {"promedio": 0, "minimo": None, "maximo": None, "desviacion": 0}
        }

    # Formateo a etiquetas Influx: "S001", "S002", ...
    sensor_ids = [f"S{id_:03d}" for id_ in ids]
    print(f"[DEBUG-REL] Sensor IDs (tags Influx) a consultar: {sensor_ids}")

    # 2) Construcción del script Flux con pivot
    lista = ",".join(f'"{sid}"' for sid in sensor_ids)
    flux = f'''
from(bucket: "{bucket}")
  |> range(start: {desde}, stop: {hasta})

  // 1) Traer tanto valor como parametro
  |> filter(fn: (r) =>
       r._measurement == "lecturas_sensores" and
       (r._field == "valor" or r._field == "parametro")
     )

  // 2) Pivotar para tener valor y parametro en la misma fila
  |> pivot(
       rowKey:      ["_time","sensor_id"],
       columnKey:   ["_field"],
       valueColumn: "_value"
     )

  // 3) Filtrar por sensor y por parámetro
  |> filter(fn: (r) => contains(value: r.sensor_id, set: [{lista}]) and
                      r.parametro == "{tipo_parametro}")

  // 4) Agregar ventana sobre la columna 'valor'
  |> aggregateWindow(every: {window_every}, fn: mean, column: "valor")
  |> yield(name: "serie")
'''
    print("── FLUX CORREGIDO ───────────────────────────────────")
    print(flux)
    print("──────────────────────────────────────────────────")

    # 3) Ejecuto Flux
    tables = query_api.query(flux, org=org)

    # 4) Compilo la serie leyendo de la columna "valor" y descartando None
    series = []
    for table in tables:
        for rec in table.records:
            val = rec.values.get("valor")
            if val is None:
                continue
            series.append({
                "timestamp": rec.get_time().isoformat(),
                "value":     val
            })

    # 5) Estadísticas (solo si hay valores válidos)
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
