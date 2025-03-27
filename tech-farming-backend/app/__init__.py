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

    db.init_app(app)
    migrate.init_app(app, db)

    # Rutas, Blueprints, etc.
    from app.routes import register_routes
    register_routes(app)
    from app import models
    return app
