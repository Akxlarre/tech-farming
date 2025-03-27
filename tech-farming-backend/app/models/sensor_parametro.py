from app import db

class SensorParametro(db.Model):
    __tablename__ = 'sensor_parametros'
    id = db.Column(db.Integer, primary_key=True)
    sensor_id = db.Column(db.Integer, db.ForeignKey('sensores.id'), nullable=False)
    tipo_sensor_id = db.Column(db.Integer, db.ForeignKey('tipos_sensor.id'), nullable=False)

    umbral = db.relationship('ConfiguracionUmbral', backref='parametro', uselist=False)
    alertas = db.relationship('Alerta', backref='parametro', lazy=True)