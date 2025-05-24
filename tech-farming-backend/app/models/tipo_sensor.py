from app import db

class TipoSensor(db.Model):
    __tablename__ = 'tipos_sensor'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50))
    descripcion = db.Column(db.Text)

    sensores = db.relationship('Sensor', backref='tipo_sensor', cascade="all, delete-orphan", lazy=True)