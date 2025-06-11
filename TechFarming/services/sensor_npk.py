import serial
import time
import RPi.GPIO as GPIO
from core.logger_service import configurar_logger

logger = configurar_logger()

class NPKSensor:
    def __init__(self, gpio, alias="", token=None):
        self.alias = alias
        self.token = token
        self.gpio = gpio  # GPIO usado para RE/DE
        self.port = "/dev/serial0"
        self.baudrate = 4800
        self.slave_id = 0x01
        self.timeout = 1

        try:
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(self.gpio, GPIO.OUT)
            GPIO.output(self.gpio, GPIO.LOW)

            self.serial = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                bytesize=8,
                parity=serial.PARITY_NONE,
                stopbits=1,
                timeout=self.timeout
            )
            logger.info(f"NPKSensor inicializado en GPIO {gpio}")
        except Exception as e:
            logger.error(f"Error inicializando NPKSensor en GPIO {gpio}: {e}")
            raise

    def _build_modbus_request(self, register):
        request = bytearray([self.slave_id, 0x03, 0x00, register, 0x00, 0x01])
        crc = self._crc16(request)
        request += crc.to_bytes(2, byteorder='little')
        return request

    def _crc16(self, data: bytearray):
        crc = 0xFFFF
        for pos in data:
            crc ^= pos
            for _ in range(8):
                lsb = crc & 0x0001
                crc >>= 1
                if lsb:
                    crc ^= 0xA001
        return crc

    def _read_register(self, reg):
        try:
            GPIO.output(self.gpio, GPIO.HIGH)  # Enable TX
            request = self._build_modbus_request(reg)
            self.serial.write(request)
            time.sleep(0.1)  # más tiempo
            GPIO.output(self.gpio, GPIO.LOW)  # Enable RX
            response = self.serial.read(9)
            print(f"Registro {reg:02X} → respuesta: {response.hex()}")  # nuevo
            if len(response) >= 5:
                return response[3] << 8 | response[4]
            else:
                logger.warning(f"Respuesta incompleta al leer registro {reg}")
                return None
        except Exception as e:
            logger.warning(f"Error al leer registro {reg}: {e}")
            return None

    def leer_dato(self):
        try:
            nitrogeno = self._read_register(0x1E)
            fosforo = self._read_register(0x1F)
            potasio = self._read_register(0x20)

            datos = {
                "alias": self.alias,
                "token": self.token,
                "gpio": self.gpio,
                "tipo": "ZTS-3002-TR-NPK-N01",
                "nitrato": nitrogeno,
                "fosforo": fosforo,
                "potasio": potasio,
                "timestamp": time.time()
            }
            logger.info(f"NPKSensor lectura OK: {datos}")
            return datos
        except Exception as e:
            logger.error(f"Error al leer NPKSensor: {e}")
            return {
                "alias": self.alias,
                "token": self.token,
                "gpio": self.gpio,
                "tipo": "ZTS-3002-TR-NPK-N01",
                "error": str(e),
                "timestamp": time.time()
            }
