import adafruit_dht
import board
import time
from core.logger_service import configurar_logger
from datetime import datetime
from zoneinfo import ZoneInfo

logger = configurar_logger()

class DHT22Sensor:
    def __init__(self, gpio, alias="", token=None):
        self.alias = alias
        self.token = token
        self.gpio = gpio
        try:
            self.sensor = adafruit_dht.DHT22(getattr(board, f"D{gpio}"))
            logger.info(f"DHT22Sensor inicializado en GPIO {gpio}")
        except Exception as e:
            logger.error(f"Error inicializando DHT22 en GPIO {gpio}: {e}")
            raise

    def leer_dato(self):
        ahora = datetime.now(ZoneInfo("America/Santiago")).isoformat()
        try:
            temperatura = self.sensor.temperature
            humedad = self.sensor.humidity
            datos = {
                "alias": self.alias,
                "token": self.token,
                "gpio": self.gpio,
                "tipo": "DHT22",
                "Humedad": humedad,
                "Temperatura": temperatura,
                "timestamp": ahora
            }
            logger.info(f"DHT22 lectura OK: {datos}")
            return datos
        except Exception as e:
            logger.warning(f"Error al leer DHT22 en GPIO {self.gpio}: {e}")
            return {
                "alias": self.alias,
                "token": self.token,
                "gpio": self.gpio,
                "tipo": "DHT22",
                "error": str(e),
                "timestamp": ahora
            }
