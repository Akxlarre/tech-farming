from app import db

class SensorParametro(db.Model):
    __tablename__ = 'sensor_parametros'
    id = db.Column(db.Integer, primary_key=True)
    sensor_id = db.Column(db.Integer, db.ForeignKey('sensores.id'), nullable=False)
    tipo_parametro_id = db.Column(db.Integer, db.ForeignKey('tipos_parametro.id'), nullable=False)

    umbrales = db.relationship('ConfiguracionUmbral', backref='sensor_parametro', uselist=False, cascade="all, delete-orphan", lazy=True)
    alertas = db.relationship('Alerta', backref='sensor_parametro', cascade="all, delete-orphan", lazy=True)