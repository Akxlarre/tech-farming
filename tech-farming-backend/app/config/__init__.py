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
    INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")    

    # Intentar conectar con InfluxDB
    try:
        client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG)
        write_api = client.write_api()
        print("✅ Conexión exitosa a InfluxDB")
    except Exception as e:
        print(f"❌ Error conectando a InfluxDB: {e}")

def escribir_dato(sensor_id, tipo_sensor, invernadero_id, zona, valor, unidad=None, pos_x=None, pos_y=None):
    point = (
        Point("lecturas_sensores")
        .tag("sensor_id", sensor_id)
        .tag("tipo_sensor", tipo_sensor)
        .tag("invernadero_id", invernadero_id)
        .tag("zona", zona)
        .field("valor", valor)
        .time(datetime.utcnow())  # ✅ Corregido: Agregar timestamp válido
    )

    # Agregar campos opcionales si existen
    if unidad:
        point.field("unidad", unidad)
    if pos_x is not None:
        point.field("pos_x", pos_x)
    if pos_y is not None:
        point.field("pos_y", pos_y)

    # Escribir dato solo si la conexión fue exitosa
    if Config.client:
        Config.write_api.write(bucket=Config.INFLUXDB_BUCKET, org=Config.INFLUXDB_ORG, record=point)
        print("✅ Dato insertado correctamente en InfluxDB")
    else:
        print("❌ No se pudo insertar el dato porque la conexión a InfluxDB falló.")

# Prueba con un dato de ejemplo
escribir_dato(sensor_id="S001", tipo_sensor="Temperatura", invernadero_id="IV01", zona="Norte", valor=25.3, unidad="C")
