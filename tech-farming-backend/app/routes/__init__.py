from app.routes.api import api_bp
from app.routes.sensores import router as sensores_bp
from app.routes.invernaderos import router as invernaderos_bp
from app.routes.tipos_sensor import router as tipos_sensor_bp
from app.routes.tipos_parametro import router as tipos_parametro_bp
from app.routes.alertas import router as alertas_bp
from app.routes.umbrales import router as umbrales_bp
from app.routes.zonas import router as zonas_bp
from app.routes.zonas_sensores import router as zonas_sensores_bp
from app.routes.historial import router as historial_bp
from app.routes.sensor_parametros import router as sensor_parametros_bp
from app.routes.usuarios import router as usuarios_bp


def register_routes(app):
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(sensores_bp)
    app.register_blueprint(invernaderos_bp, url_prefix='/api/invernaderos')
    app.register_blueprint(tipos_sensor_bp, url_prefix='/api/tipos-sensor')
    app.register_blueprint(tipos_parametro_bp, url_prefix='/api/parametros')
    app.register_blueprint(alertas_bp, url_prefix='/api/alertas')
    app.register_blueprint(umbrales_bp, url_prefix='/api/umbrales')
    app.register_blueprint(zonas_bp, url_prefix='/api')
    app.register_blueprint(zonas_sensores_bp, url_prefix='/api/zonas')
    app.register_blueprint(historial_bp, url_prefix='/api')
    app.register_blueprint(sensor_parametros_bp)
    app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')
