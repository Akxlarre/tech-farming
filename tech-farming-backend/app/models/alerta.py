from datetime import datetime
from app import db

class Alerta(db.Model):
    __tablename__ = 'alertas'
    id = db.Column(db.Integer, primary_key=True)
    sensor_parametro_id = db.Column(db.Integer, db.ForeignKey('sensor_parametros.id'))
    tipo = db.Column(db.String(50))
    mensaje = db.Column(db.Text)
    valor_detectado = db.Column(db.Numeric)
    fecha_hora = db.Column(db.DateTime, default=datetime.utcnow)
    nivel = db.Column(db.String(20))
    estado = db.Column(db.String(20), default="activo")
    fecha_resolucion = db.Column(db.DateTime, nullable=True)
    resuelta_por = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)

    usuario_resolutor = db.relationship("Usuario", foreign_keys=[resuelta_por])