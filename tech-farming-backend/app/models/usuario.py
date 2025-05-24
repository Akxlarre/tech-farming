from datetime import datetime
from app import db

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    rol_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    usuario_admin_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    supabase_uid = db.Column(db.UUID(as_uuid=True), unique=True, nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    administrador = db.relationship('Usuario', remote_side=[id], backref='trabajadores', lazy=True)
    invernaderos = db.relationship('Invernadero', backref='usuario', lazy=True)
    permisos = db.relationship('UsuarioPermiso', backref='usuario', lazy=True)