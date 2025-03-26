from flask import Blueprint

def register_routes(app):
    from app.routes.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
