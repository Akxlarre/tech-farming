from datetime import datetime
from app import db

class Zona(db.Model):
    __tablename__ = 'zonas'
    id             = db.Column(db.Integer, primary_key=True)
    invernadero_id = db.Column(db.Integer, db.ForeignKey('invernaderos.id'), nullable=False)
    nombre         = db.Column(db.String(100), nullable=False)
    descripcion    = db.Column(db.Text)
    creado_en      = db.Column(db.DateTime, default=datetime.utcnow)
    activo         = db.Column(db.Boolean, default=True)

    invernadero   = db.relationship(
                       'Invernadero',
                       back_populates='zonas'
                    )
    sensores      = db.relationship(
                       'Sensor',
                       back_populates='zona',
                       cascade="all, delete-orphan",
                       lazy=True
                    )
