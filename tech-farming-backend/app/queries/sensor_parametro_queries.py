from app import db
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