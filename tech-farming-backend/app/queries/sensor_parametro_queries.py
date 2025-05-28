from app import db
from app.models.sensor import Sensor
from app.models.sensor_parametro import SensorParametro
from app.models.tipo_parametro import TipoParametro
from sqlalchemy import func

def insertar_sensor_parametros(sensor_id, nombres_parametros):
    try:
        for nombre in nombres_parametros:
            tipo_parametro = TipoParametro.query.filter_by(nombre=nombre).first()
            if tipo_parametro:
                nuevo_sensor_parametro = SensorParametro(
                    sensor_id=sensor_id,
                    tipo_parametro_id=tipo_parametro.id
                )
                db.session.add(nuevo_sensor_parametro)
        
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        print(f"Error al insertar parámetros del sensor: {e}")
        
def obtener_sensores_con_tipos_por_zona(zona_id: int) -> list[dict]:
    """
    Para una zona dada, devuelve un objeto por sensor:
    { id, nombre, tipos: [<param1>, <param2>, …] }
    """
    # Hacemos JOIN y agregamos array de tipos
    rows = (
        db.session.query(
            Sensor.id.label('id'),
            Sensor.nombre.label('nombre'),
            func.array_agg(TipoParametro.nombre).label('tipos')
        )
        .join(SensorParametro, SensorParametro.sensor_id == Sensor.id)
        .join(TipoParametro,   SensorParametro.tipo_parametro_id == TipoParametro.id)
        .filter(Sensor.zona_id == zona_id)
        .group_by(Sensor.id, Sensor.nombre)
        .order_by(Sensor.nombre)
        .all()
    )

    return [
        {
            "id":     r.id,
            "nombre": r.nombre,
            "tipos":  r.tipos  # ya es una lista de strings
        }
        for r in rows
    ]