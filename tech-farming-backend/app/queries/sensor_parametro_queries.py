from app import db
from app.models.sensor import Sensor
from app.models.sensor_parametro import SensorParametro
from app.models.tipo_parametro import TipoParametro

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
def obtener_sensores_con_parametros_por_zona(zona_id: int) -> list[dict]:
    """
    Para una zona dada, devuelve una entrada por cada combinación
    sensor + tipo_parametro, con la forma:
    { id, nombre, tipo }
    """
    # Construimos el JOIN:
    #   sensor_parametros → sensores → tipos_parametro
    rows = (
        db.session.query(
            Sensor.id.label('id'),
            Sensor.nombre.label('nombre'),
            TipoParametro.nombre.label('tipo')
        )
        .join(SensorParametro, SensorParametro.sensor_id == Sensor.id)
        .join(TipoParametro,   SensorParametro.tipo_parametro_id == TipoParametro.id)
        .filter(Sensor.zona_id == zona_id)
        .order_by(Sensor.id, TipoParametro.nombre)
        .all()
    )
    # Mapeamos a JSON simple
    return [
        {"id":   r.id,
         "nombre": r.nombre,
         "tipo":   r.tipo}
        for r in rows
    ]