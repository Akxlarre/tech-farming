from datetime import datetime
from app import db

class Invernadero(db.Model):
    __tablename__ = 'invernaderos'
    id          = db.Column(db.Integer, primary_key=True)
    usuario_id  = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    nombre      = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    creado_en   = db.Column(db.DateTime, default=datetime.utcnow)

    zonas       = db.relationship(
                     'Zona',
                     back_populates='invernadero',
                     cascade="all, delete-orphan",
                     lazy=True
                  )

    permisos = db.relationship('UsuarioPermiso', backref='invernadero', lazy=True)
