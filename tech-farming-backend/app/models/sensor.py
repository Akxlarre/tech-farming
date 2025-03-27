from datetime import date
from app import db

class Sensor(db.Model):
    __tablename__ = 'sensores'
    id = db.Column(db.Integer, primary_key=True)
    invernadero_id = db.Column(db.Integer, db.ForeignKey('invernaderos.id'), nullable=False)
    nombre = db.Column(db.String(100))
    descripcion = db.Column(db.Text)
    estado = db.Column(db.Boolean, default=True)
    fecha_instalacion = db.Column(db.Date)
    pos_x = db.Column(db.Integer)
    pos_y = db.Column(db.Integer)
    zona = db.Column(db.String(50))

    parametros = db.relationship('SensorParametro', backref='sensor', lazy=True)