def register_routes(app):
    from app.routes.api import api_bp
    from app.routes.sensores import sensores_bp

    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(sensores_bp, url_prefix='/api/sensores')
