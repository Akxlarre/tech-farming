# seed_two_sensors_24h.py

import random
import time
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from influxdb_client import Point

# ---------------------------------------------------
# Función para escribir un dato en InfluxDB
# ---------------------------------------------------
def escribir_dato(sensor_id, parametro, valor, ts: datetime = None):
    """
    Inserta un punto en InfluxDB con:
      - measurement = "lecturas_sensores"
      - tag "sensor_id" = sensor_id (string)
      - field "parametro" = parametro (string: "temperature" o "humidity")
      - field "valor" = valor (float)
      - time = ts (si se pasa) o la hora actual en Chile si ts es None
    """
    if sensor_id is None or parametro is None or valor is None:
        print("⚠️ Error: sensor_id, parametro y valor son obligatorios")
        return

    if ts is None:
        ts = datetime.now(ZoneInfo("America/Santiago"))

    # Importamos Config que ya debe haber sido configurado en tu app.
    from app.config import Config

    point = (
        Point("lecturas_sensores")
        .tag("sensor_id", str(sensor_id))
        .field("parametro", parametro)
        .field("valor", float(valor))
        .time(ts)
    )

    if Config.client:
        Config.write_api.write(
            bucket=Config.INFLUXDB_BUCKET,
            org=Config.INFLUXDB_ORG,
            record=point
        )
        print(f"✅ Dato insertado: sensor_id={sensor_id}, parametro={parametro}, valor={valor}, timestamp={ts.isoformat()}")
    else:
        print("❌ No se pudo insertar el dato porque la conexión a InfluxDB falló.")


# ---------------------------------------------------
# Script principal para generar 24 horas de datos
# ---------------------------------------------------
def main():
    # Sensores que vamos a poblar
    sensor_ids = [48, 49]

    # 1) Punto de inicio: hace 24 horas
    ahora  = datetime.now(ZoneInfo("America/Santiago"))
    inicio = ahora - timedelta(hours=24)

    # 2) Intervalo de 30 minutos
    intervalo = timedelta(minutes=30)

    # 3) Cantidad de pasos dentro de 24 horas (24h / 0.5h = 48)
    pasos = int(timedelta(hours=24) / intervalo)  # = 48

    for sensor_id in sensor_ids:
        print(f"\n⏳ Generando datos de 24 horas para sensor_id={sensor_id} …")
        ts = inicio
        for i in range(pasos):
            # 3.a) Temperatura aleatoria [18.0, 28.0] a las “ts”
            temp_val = round(random.uniform(18.0, 28.0), 2)
            escribir_dato(sensor_id, "Temperatura", temp_val, ts)

            # 3.b) Humedad aleatoria [45.0, 65.0] 5 minutos después
            hum_val = round(random.uniform(45.0, 65.0), 2)
            escribir_dato(sensor_id, "Humedad", hum_val, ts + timedelta(minutes=5))

            # (Opcional) Si quisieras simular N, P, K, descomenta estas líneas:
            # n_val = round(random.uniform(100.0, 200.0), 2)
            # escribir_dato(sensor_id, "N", n_val, ts + timedelta(minutes=10))
            # p_val = round(random.uniform(50.0, 100.0), 2)
            # escribir_dato(sensor_id, "P", p_val, ts + timedelta(minutes=15))
            # k_val = round(random.uniform(100.0, 150.0), 2)
            # escribir_dato(sensor_id, "K", k_val, ts + timedelta(minutes=20))

            # 3.c) Avanzar ts 30 min
            ts = ts + intervalo

            # Pequeña pausa para no saturar Influx (no afecta al timestamp que ya pasó)
            time.sleep(0.1)

        print(f"✅ 24 horas de datos (cada 30 min) insertadas para sensor_id={sensor_id}.")

    print("\n👍 Finalizado: tienes 24 horas de datos para cada sensor (48 registros de temperature + 48 de humidity).")


if __name__ == "__main__":
    main()
