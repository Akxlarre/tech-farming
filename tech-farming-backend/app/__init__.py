import logging
import os
import click
from dotenv import load_dotenv
from datetime import datetime

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

from app.config import Config

# Cargar .env
load_dotenv()

# Extensiones
db      = SQLAlchemy()
jwt     = JWTManager()
migrate = Migrate()

# InfluxDB
try:
    influx_client    = InfluxDBClient(
        url=Config.INFLUXDB_URL,
        token=Config.INFLUXDB_TOKEN,
        org=Config.INFLUXDB_ORG
    )
    influx_write_api = influx_client.write_api(write_options=SYNCHRONOUS)
    print("✅ Conexión exitosa a InfluxDB")
except Exception as e:
    influx_client    = None
    influx_write_api = None
    print(f"❌ Error conectando a InfluxDB: {e}")

def escribir_dato(sensor_id: str, parametro: str, valor: float):
    """Inserta un punto en InfluxDB."""
    if not sensor_id or not parametro or valor is None:
        print("⚠️ sensor_id, parametro y valor son obligatorios")
        return

    point = (
        Point("lecturas_sensores")
        .tag("sensor_id", sensor_id)
        .field("parametro", parametro)
        .field("valor", valor)
        .time(datetime.utcnow())
    )

    if influx_client and influx_write_api:
        influx_write_api.write(
            bucket=Config.INFLUXDB_BUCKET,
            org=Config.INFLUXDB_ORG,
            record=point
        )
        print(f"✅ Dato insertado: {sensor_id}, {parametro}={valor}")
    else:
        print("❌ No se pudo insertar el dato.")

@click.command("insertar-lectura")
@click.argument("sensor_id", type=int)
@click.argument("parametro", type=str)
@click.argument("valor", type=float)
def cli_insertar_lectura(sensor_id, parametro, valor):
    """flask insertar-lectura 3 Humedad 55.2"""
    escribir_dato(str(sensor_id), parametro, valor)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.logger.setLevel(logging.DEBUG)

    # CORS
    CORS(app,
         resources={r"/api/*": {"origins": "http://localhost:4200"}},
         supports_credentials=True)

    app.url_map.strict_slashes = False

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Registrar **solo** register_routes, que ya monta todos los blueprints
    from app.routes import register_routes
    register_routes(app)

    # Añadir comando CLI
    app.cli.add_command(cli_insertar_lectura)

    # Debug: rutas
    print("🔍 Rutas registradas:")
    for rule in app.url_map.iter_rules():
        print(f"{rule} -> {rule.endpoint}")

    # Cargar modelos
    from app import models

    from app.queries.alerta_queries import iniciar_scheduler
    iniciar_scheduler()

    return app

if __name__ == "__main__":
    # Prueba de inserción rápida
    escribir_dato("3", "N", 69.5)
    escribir_dato("4", "Potasio", 9.8)
    escribir_dato("2", "Humedad", 65.2)
