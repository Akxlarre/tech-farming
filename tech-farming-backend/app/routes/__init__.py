from app.routes.api import api_bp
from app.routes.sensores import router as sensores_bp

def register_routes(app):
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(sensores_bp)
