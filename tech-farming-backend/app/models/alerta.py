from datetime import datetime
from app import db

class Alerta(db.Model):
    __tablename__ = 'alertas'
    id = db.Column(db.Integer, primary_key=True)
    sensor_parametro_id = db.Column(db.Integer, db.ForeignKey('sensor_parametros.id'), nullable=False)
    tipo = db.Column(db.String(50))
    mensaje = db.Column(db.Text)
    valor_detectado = db.Column(db.Numeric)
    fecha_hora = db.Column(db.DateTime, default=datetime.utcnow)
    nivel = db.Column(db.String(20))