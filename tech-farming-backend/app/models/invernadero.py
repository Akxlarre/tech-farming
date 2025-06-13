from datetime import datetime
from zoneinfo import ZoneInfo
from app import db

class Invernadero(db.Model):
    __tablename__ = 'invernaderos'
    id          = db.Column(db.Integer, primary_key=True)
    nombre      = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    creado_en   = db.Column(
        db.DateTime,
        default=lambda: datetime.now(ZoneInfo("America/Santiago"))
    )

    zonas       = db.relationship(
                     'Zona',
                     back_populates='invernadero',
                     cascade="all, delete-orphan",
                     lazy=True
                  )
    umbrales   = db.relationship(
                       'ConfiguracionUmbral',
                       backref='invernadero',
                       cascade="all, delete-orphan",
                       lazy=True
                    )
