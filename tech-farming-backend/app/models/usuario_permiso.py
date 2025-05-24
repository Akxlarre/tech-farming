from app import db

class UsuarioPermiso(db.Model):
    __tablename__ = 'usuarios_permisos'  
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    invernadero_id = db.Column(db.Integer, db.ForeignKey('invernaderos.id'), nullable=False)
    puede_ver = db.Column(db.Boolean, default=False)
    puede_crear = db.Column(db.Boolean, default=False)
    puede_editar = db.Column(db.Boolean, default=False)
    puede_eliminar = db.Column(db.Boolean, default=False)
