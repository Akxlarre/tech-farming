from datetime import datetime
from zoneinfo import ZoneInfo
from app import db

class Alerta(db.Model):
    __tablename__ = 'alertas'

    id = db.Column(db.Integer, primary_key=True)

    sensor_id = db.Column(db.Integer, db.ForeignKey('sensores.id'), nullable=True)
    sensor_parametro_id = db.Column(db.Integer, db.ForeignKey('sensor_parametros.id'), nullable=True)
    tipo = db.Column(db.String(50), nullable=False)
    mensaje = db.Column(db.Text, nullable=False)
    valor_detectado = db.Column(db.Numeric, nullable=True)
    fecha_hora = db.Column(
        db.DateTime,
        default=lambda: datetime.now(ZoneInfo("America/Santiago")),
        nullable=False
    )
    nivel = db.Column(db.String(20))
    estado = db.Column(db.String(20), default="activo", nullable=False)
    fecha_resolucion = db.Column(db.DateTime, nullable=True)
    resuelta_por = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)

    # Relaciones
    sensor = db.relationship("Sensor", foreign_keys=[sensor_id], back_populates="alertas")
    usuario_resolutor = db.relationship("Usuario", foreign_keys=[resuelta_por])
