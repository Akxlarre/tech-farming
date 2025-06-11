import importlib

class BaseSensor:
    def leer_dato(self):
        raise NotImplementedError("Debe implementar el método leer_dato()")

def crear_sensor(sensor_config):
    tipo = sensor_config.get("tipo")
    gpio = sensor_config.get("gpio")
    alias = sensor_config.get("alias")
    token = sensor_config.get("token")

    if tipo == "DHT22":
        modulo = importlib.import_module("services.sensor_dht22")
        return modulo.DHT22Sensor(gpio=gpio, alias=alias, token=token)

    elif tipo == "ZTS-3002-TR-NPK-N01":
        modulo = importlib.import_module("services.sensor_npk")
        return modulo.NPKSensor(gpio=gpio, alias=alias, token=token)

    else:
        raise ValueError(f"Tipo de sensor desconocido: {tipo}")
