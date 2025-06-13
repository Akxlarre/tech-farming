from datetime import datetime
from zoneinfo import ZoneInfo
from app import db

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    apellido = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True, nullable=True)
    telefono = db.Column(db.String(14), unique=True, nullable=True)
    avatar_url = db.Column(db.String(200), nullable=True)
    rol_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    usuario_admin_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    supabase_uid = db.Column(db.UUID(as_uuid=True), unique=True, nullable=False)
    fecha_creacion = db.Column(
        db.DateTime,
        default=lambda: datetime.now(ZoneInfo("America/Santiago"))
    )

    administrador = db.relationship('Usuario', remote_side=[id], backref='trabajadores', lazy=True)
    permisos = db.relationship('UsuarioPermiso', backref='usuario', lazy=True)
