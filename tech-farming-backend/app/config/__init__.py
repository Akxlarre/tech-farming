import os
from dotenv import load_dotenv
from influxdb_client import InfluxDBClient, Point
from datetime import datetime

# Cargar las variables del archivo .env
load_dotenv()

class Config:
    # Variables Supabase
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Variables InfluxDB
    INFLUXDB_URL = os.getenv("INFLUXDB_URL")
    INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
    INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
    INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET", "temporalSeries_v3")  # Fallback

    # Intentar conectar con InfluxDB
    try:
        client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG)
        write_api = client.write_api()
        print("✅ Conexión exitosa a InfluxDB")
    except Exception as e:
        print(f"❌ Error conectando a InfluxDB: {e}")
        client = None

def escribir_dato(sensor_id, parametro, valor):
    if not sensor_id or not parametro or valor is None:
        print("⚠️ Error: sensor_id, parametro y valor son obligatorios")
        return

    point = (
        Point("lecturas_sensores")
        .tag("sensor_id", sensor_id)
        .field("parametro", parametro)
        .field("valor", valor)
        .time(datetime.utcnow())
    )

    if Config.client:
        Config.write_api.write(bucket=Config.INFLUXDB_BUCKET, org=Config.INFLUXDB_ORG, record=point)
        print(f"✅ Dato insertado: sensor_id={sensor_id}, parametro={parametro}, valor={valor}")
    else:
        print("❌ No se pudo insertar el dato porque la conexión a InfluxDB falló.")

# Prueba con datos de ejemplo
escribir_dato(sensor_id="S001", parametro="humedad", valor=60.5)
escribir_dato(sensor_id="S002", parametro="ph", valor=6.8)

