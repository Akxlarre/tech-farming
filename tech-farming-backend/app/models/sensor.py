from datetime import date, datetime
from app import db
import secrets

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
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    tipo_sensor_id = db.Column(db.Integer, db.ForeignKey('tipos_sensor.id'), nullable=False)
    token = db.Column(db.String(64), unique=True, nullable=False)

    parametros = db.relationship('SensorParametro', backref='sensor', cascade="all, delete-orphan", lazy=True)