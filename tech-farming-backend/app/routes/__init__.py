from app.routes.api import api_bp
from app.routes.sensores import router as sensores_bp
from app.routes.invernaderos import router as invernaderos_bp
from app.routes.tipos_sensor import router as tipos_sensor_bp
from app.routes.tipos_parametro import router as tipos_parametro_bp

def register_routes(app):
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(sensores_bp, url_prefix='/api/sensores')
    app.register_blueprint(invernaderos_bp, url_prefix='/api/invernaderos')
    app.register_blueprint(tipos_sensor_bp, url_prefix='/api/tipo-sensor')
    app.register_blueprint(tipos_parametro_bp, url_prefix='/api/tipos-parametro')
