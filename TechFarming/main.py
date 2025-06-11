import time
import json
import os
import threading
from core.sensor_factory import crear_sensor
from services.data_formatter import formatear_datos
from services.http_client import enviar_datos
from services.retry_manager import guardar_en_buffer, reintentar_envio
from core.logger_service import configurar_logger

CONFIG_FILE = "config/sensors.json"

logger = configurar_logger()

def cargar_config():
    if not os.path.exists(CONFIG_FILE):
        logger.error("Archivo de configuración no encontrado.")
        return []
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)

def reintento_periodico():
    while True:
        reintentar_envio()
        time.sleep(300)

def main():
    logger.info("Iniciando sistema de monitoreo de sensores...")
    print("📦 Cargando configuración de sensores...")
    sensores_config = cargar_config()
    sensores = []

    for config in sensores_config:
        try:
            sensor = crear_sensor(config)
            sensores.append(sensor)
            logger.info(f"Sensor {config['alias']} ({config['tipo']}) cargado en GPIO {config['gpio']}")
        except Exception as e:
            logger.error(f"Error al cargar sensor {config.get('alias', '')}: {e}")

    # Lanzar reintento de envío de datos en segundo plano
    threading.Thread(target=reintento_periodico, daemon=True).start()

    print("\n🔁 Iniciando ciclo de lectura y envío. Presiona Ctrl+C para detener.")
    try:
        while True:
            for sensor in sensores:
                datos_crudos = sensor.leer_dato()
                logger.info(f"Lectura obtenida: {datos_crudos}")
                print(f"📍 {datos_crudos}")

                payload = formatear_datos(datos_crudos)

                if "error" in datos_crudos:
                    logger.warning(f"❌ Error al leer sensor {sensor.alias}: {datos_crudos['error']}")
                else:
                    exito = enviar_datos(payload)
                    if not exito:
                        logger.warning("Fallo en el envío, guardando en buffer.")
                        guardar_en_buffer(payload)

            time.sleep(30)
    except KeyboardInterrupt:
        logger.info("Ciclo de lectura detenido por el usuario.")
        print("\n🛑 Ciclo detenido por el usuario.")

if __name__ == "__main__":
    main()
