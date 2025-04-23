from app.routes.api import api_bp
from app.routes.sensores import router as sensores_bp
from app.routes.invernaderos import router as invernaderos_bp
from app.routes.zonas import router as zonas_bp
from app.routes.tipo_sensor import router as tipo_sensor_bp

def register_routes(app):
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(sensores_bp, url_prefix='/api/sensores')
    app.register_blueprint(invernaderos_bp, url_prefix='/api/invernaderos')
    app.register_blueprint(zonas_bp, url_prefix='/api/zonas')
    app.register_blueprint(tipo_sensor_bp, url_prefix='/api/tipo-sensor')
