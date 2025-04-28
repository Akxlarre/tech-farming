from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from app.config import Config  

# Cargar variables de entorno
load_dotenv()

# Instancias de extensiones
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:4200"}}, supports_credentials=True)
    app.url_map.strict_slashes = False
    db.init_app(app)
    migrate.init_app(app, db)

    # Cargar rutas
    from app.routes import register_routes
    register_routes(app)

    # 🔎 Mostrar las rutas registradas (debug)
    print("🔍 Rutas registradas:")
    for rule in app.url_map.iter_rules():
        print(f"{rule} -> {rule.endpoint}")

    from app import models
    return app

