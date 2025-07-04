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
frontends = [
        "http://localhost:4200",
        "https://subtle-tanuki-f491cb.netlify.app",        # tu Netlify
        "https://tech-farming-production.up.railway.app",  # o el dominio Railway que use tu front
            ]
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


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.logger.setLevel(logging.DEBUG)

    CORS(app,
        resources={r"/api/*": {"origins": frontends}},
        supports_credentials=True)

    app.url_map.strict_slashes = False

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Registrar **solo** register_routes, que ya monta todos los blueprints
    from app.routes import register_routes
    register_routes(app)

    # Debug: rutas
    print("🔍 Rutas registradas:")
    for rule in app.url_map.iter_rules():
        print(f"{rule} -> {rule.endpoint}")

    # Cargar modelos
    from app import models

    from app.queries.alerta_queries import iniciar_scheduler
    iniciar_scheduler(app)

    return app
