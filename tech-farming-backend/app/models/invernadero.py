from datetime import datetime
from app import db

class Invernadero(db.Model):
    __tablename__ = 'invernaderos'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    nombre = db.Column(db.String(100))
    descripcion = db.Column(db.Text)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)

    sensores = db.relationship('Sensor', backref='invernadero', cascade="all, delete-orphan", lazy=True)