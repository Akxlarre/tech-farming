# app/queries/zona_queries.py

from app.models.zona import Zona as ZonaModel

def obtener_zonas_por_invernadero(invernadero_id: int) -> list[dict]:
    """
    Devuelve una lista de zonas para un invernadero dado,
    cada una con su id y nombre.
    """
    zonas = (
        ZonaModel.query
        .filter_by(invernadero_id=invernadero_id)
        .order_by(ZonaModel.nombre)
        .all()
    )
    return [{"id": z.id, "nombre": z.nombre} for z in zonas]
