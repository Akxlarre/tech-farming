from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

# Instancias de extensiones
db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Configurar desde variables de entorno
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///default.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'supersecretkey')

    # Inicializar extensiones
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    # Registrar rutas
    
    @app.route('/')
    def home():
        return ("Bienvenido a la API. Accede a /api para más información.")
    
    from app.routes import register_routes
    register_routes(app)

    return app
