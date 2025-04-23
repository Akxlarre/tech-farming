from datetime import datetime
from app import db

class Zona(db.Model):
    __tablename__ = 'zonas'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    descripcion = db.Column(db.Text)
    invernadero_id = db.Column(db.Integer, db.ForeignKey('invernaderos.id'), nullable=False)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)

    sensores = db.relationship('Sensor', backref='zona', cascade="all, delete-orphan", lazy=True)