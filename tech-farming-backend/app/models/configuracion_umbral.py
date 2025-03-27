from datetime import datetime
from app import db

class ConfiguracionUmbral(db.Model):
    __tablename__ = 'umbrales'
    id = db.Column(db.Integer, primary_key=True)
    sensor_parametro_id = db.Column(db.Integer, db.ForeignKey('sensor_parametros.id'), nullable=False)
    umbral_min = db.Column(db.Numeric)
    umbral_max = db.Column(db.Numeric)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    activo = db.Column(db.Boolean, default=True)