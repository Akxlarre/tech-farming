from datetime import datetime
from sqlalchemy.orm import validates
from sqlalchemy import CheckConstraint
from app import db

class ConfiguracionUmbral(db.Model):
    __tablename__ = 'umbrales'
    id = db.Column(db.Integer, primary_key=True)
    sensor_parametro_id = db.Column(db.Integer, db.ForeignKey('sensor_parametros.id'), nullable=False)
    umbral_min = db.Column(db.Numeric)
    umbral_max = db.Column(db.Numeric)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    activo = db.Column(db.Boolean, default=True)

    __table_args__ = (
        CheckConstraint('umbral_min < umbral_max', name='check_umbral_min_max'),
    )

    @validates('umbral_min', 'umbral_max')
    def validate_umbral(self, key, value):
        if key == "umbral_max" and value is not None and self.umbral_min is not None:
            if value <= self.umbral_min:
                raise ValueError("El umbral máximo debe ser mayor que el umbral mínimo.")
        if key == "umbral_min" and value is not None and self.umbral_max is not None:
            if value >= self.umbral_max:
                raise ValueError("El umbral mínimo debe ser menor que el umbral máximo.")
        return value