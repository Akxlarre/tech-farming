from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy.orm import validates
from sqlalchemy import CheckConstraint
from app import db

class ConfiguracionUmbral(db.Model):
    __tablename__ = 'umbrales'
    id = db.Column(db.Integer, primary_key=True)
    sensor_parametro_id = db.Column(db.Integer, db.ForeignKey('sensor_parametros.id'), nullable=True)
    tipo_parametro_id = db.Column(db.Integer, db.ForeignKey('tipos_parametro.id'), nullable=False)
    invernadero_id = db.Column(db.Integer, db.ForeignKey('invernaderos.id'), nullable=True)

    advertencia_min = db.Column(db.Numeric)
    advertencia_max = db.Column(db.Numeric)
    critico_min = db.Column(db.Numeric)
    critico_max = db.Column(db.Numeric)

    creado_en = db.Column(
        db.DateTime,
        default=lambda: datetime.now(ZoneInfo("America/Santiago"))
    )
    activo = db.Column(db.Boolean, default=True)

