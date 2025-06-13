from datetime import datetime
from zoneinfo import ZoneInfo
from app import db

class Sensor(db.Model):
    __tablename__ = 'sensores'

    id = db.Column(db.Integer, primary_key=True)
    zona_id = db.Column(db.Integer, db.ForeignKey('zonas.id'), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    estado = db.Column(db.String(20), nullable=False)
    fecha_instalacion = db.Column(db.Date, nullable=False)
    creado_en = db.Column(
        db.DateTime,
        default=lambda: datetime.now(ZoneInfo("America/Santiago"))
    )
    tipo_sensor_id = db.Column(db.Integer, db.ForeignKey('tipos_sensor.id'), nullable=False)
    token = db.Column(db.String(64), unique=True, nullable=False)

    # Relaciones
    zona = db.relationship('Zona', back_populates='sensores')
    parametros = db.relationship(
        'SensorParametro',
        backref='sensor',
        cascade='all, delete-orphan',
        lazy=True
    )
    alertas = db.relationship(
        'Alerta',
        back_populates='sensor',
        cascade='all, delete-orphan',
        lazy=True
    )
