from app import db

class TipoParametro(db.Model):
    __tablename__ = 'tipos_parametro'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50))
    unidad = db.Column(db.String(20))

    umbral = db.relationship('ConfiguracionUmbral', backref='tipo_parametro', cascade="all, delete-orphan", lazy=True)
    parametros = db.relationship('SensorParametro', backref='tipo_parametro', cascade="all, delete-orphan", lazy=True)