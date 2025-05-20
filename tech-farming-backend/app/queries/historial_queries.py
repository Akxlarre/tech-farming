# app/queries/historial_queries.py

from typing import Optional, Dict, Any
from influxdb_client import QueryApi
import dateutil.parser

def obtener_historial(
    client:        QueryApi,
    bucket:        str,
    org:           str,
    invernadero_id:int,
    tipo_parametro:str,
    desde:         str,
    hasta:         str,
    zona_id:       Optional[int] = None,
    sensor_id:     Optional[int] = None,
) -> Dict[str, Any]:
    """
    Retorna un dict con:
      - series: [{timestamp, value}, …]
      - stats: { promedio, minimo:{value,fecha}, maximo:{…}, desviacion }
    """

    # 1) Base del flux
    flux = f'''
    from(bucket: "{bucket}")
      |> range(start: {desde}, stop: {hasta})
      |> filter(fn: r =>
          r._measurement == "lecturas_sensores" and
          r._field == "valor"
        )
      |> filter(fn: r =>
          r.parametro == "{tipo_parametro}"
        )
    '''

    # 2) Filtrar por sensor o por zona/invernadero
    if sensor_id:
        flux += f'\n    |> filter(fn: r => r.sensor_id == "{sensor_id}")'
    else:
        if zona_id:
            # suponiendo que la zona viene como tag en Influx
            flux += f'\n    |> filter(fn: r => r.zona == "{zona_id}")'
        else:
            flux += f'\n    |> filter(fn: r => r.invernadero_id == "{invernadero_id}")'

        # para agrupar por timestamp (ej. cada minuto) y promediar
        flux += '''
      |> aggregateWindow(every: 1m, fn: mean)
    '''

    # 3) Calcular series + stats
    flux += '''
      |> yield(name: "serie")
    
    series = from(bucket: "%s")
      |> range(start: %s, stop: %s)
      |> filter(fn: r => r._measurement=="lecturas_sensores" and r._field=="valor" and r.parametro=="%s")
      |> filter(fn: r => (sensor_id or zone/inv filter))
      |> keep(columns: ["_time","_value"])
    
    stats = series
      |> reduce(
          identity: {sum: 0.0, count: 0, min: 1e9, max: -1e9, sumsq: 0.0},
          fn: (r, accumulator) => ({
            sum:    accumulator.sum + r._value,
            count:  accumulator.count + 1,
            min:    if r._value < accumulator.min then r._value else accumulator.min,
            max:    if r._value > accumulator.max then r._value else accumulator.max,
            sumsq:  accumulator.sumsq + r._value * r._value
          })
        )
    '''
    # Aquí vendría la extracción de esos stats y el cálculo de la desviación

    # … TODO: ejecutar client.query_api().query(flux), parsear resultados …

    return {
      "series":  [],   # lista de {timestamp, value}
      "stats":   {}    # {promedio, minimo:{…}, maximo:{…}, desviacion}
    }
