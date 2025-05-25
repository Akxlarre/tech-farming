# app/queries/historial_queries.py

from typing import Optional, Dict, Any
from influxdb_client import QueryApi
from app.models.sensor import Sensor as SensorModel
from app.models.zona   import Zona   as ZonaModel
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
    window_every:   str = "5s"
) -> Dict[str, Any]:
    """
    1) Obtiene sólo los IDs de sensores según invernadero/zona/sensor.
    2) Filtra en Flux por esos sensor_id, parametro y rango de tiempo.
    3) Devuelve series y stats.
    """

    # 1) Prioridad de filtros: sensor > zona > invernadero
    if sensor_id is not None:
        ids = [sensor_id]
    else:
        q = SensorModel.query
        if zona_id is not None:
            q = q.filter_by(zona_id=zona_id)
        else:
            q = q.join(ZonaModel).filter(ZonaModel.invernadero_id == invernadero_id)
        ids = [row[0] for row in q.with_entities(SensorModel.id).all()]

    if not ids:
        return { "series": [], "stats": {"promedio": 0, "minimo": None, "maximo": None, "desviacion": 0} }

    # 2) Construcción del script Flux
    sensor_ids = [str(id_) for id_ in ids]
    lista      = ",".join(f'"{sid}"' for sid in sensor_ids)

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

  |> filter(fn: (r) => contains(value: r.sensor_id, set: [{lista}]) and
                      r.parametro == "{tipo_parametro}")

  |> aggregateWindow(every: {window_every}, fn: mean, column: "valor")
  |> yield(name: "serie")
'''

    # 3) Ejecutar Flux y compilar resultados
    tables = query_api.query(flux, org=org)
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

    # 4) Estadísticas
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

    return { "series": series, "stats": stats }