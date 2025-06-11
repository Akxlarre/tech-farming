import json
import requests
import os
from utils.backend import get_backend_base_url

CONFIG_FILE = "config/sensors.json"
API_VALIDATE_URL = f"{get_backend_base_url()}/api/sensores/validar-token"

# Sensores permitidos
SENSOR_TYPES = {
    "1": "ZTS-3002-TR-NPK-N01",
    "2": "DHT22"
}

# Mapeo de pines físicos a GPIO (BCM)
PIN_MAP = {
    7: 4,
    11: 17,
    12: 18,
    13: 27,
    15: 22,
    16: 23,
    18: 24,
    22: 25,
    29: 5,
    31: 6,
    32: 12,
    33: 13,
    35: 19,
    36: 16,
    37: 26,
    38: 20,
    40: 21
}
VALID_PHYSICAL_PINS = list(PIN_MAP.keys())

def validar_token(token):
    try:
        response = requests.post(API_VALIDATE_URL, json={"token": token})
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error de conexión con el backend: {e}")
        return False

def obtener_sensores():
    sensores = []
    pines_ocupados = set()
    tokens_ocupados = set()
    i = 1

    # Cargar sensores ya existentes
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                existentes = json.load(f)
                for s in existentes:
                    pines_ocupados.add(s["gpio"])
                    tokens_ocupados.add(s["token"])
        except:
            pass

    while True:
        print("\n¿Qué tipo de sensor deseas agregar?")
        for key, value in SENSOR_TYPES.items():
            print(f" {key}) {value}")
        tipo_op = input(" ➤ Opción: ").strip()

        if tipo_op not in SENSOR_TYPES:
            print("❌ Tipo inválido. Intenta de nuevo.")
            continue

        tipo = SENSOR_TYPES[tipo_op]

        # Mostrar opciones de pines físicos disponibles
        print("\n📌 Selecciona el número de pin físico:")
        for pin_fisico in VALID_PHYSICAL_PINS:
            gpio = PIN_MAP[pin_fisico]
            ocupado = "(Ocupado)" if gpio in pines_ocupados else ""
            print(f" {pin_fisico} → GPIO {gpio} {ocupado}")

        while True:
            try:
                pin_fisico = int(input(" ➤ Ingrese el número de pin físico (ej: 11): ").strip())
                if pin_fisico not in VALID_PHYSICAL_PINS:
                    print("❌ Pin físico no permitido. Revisa la lista mostrada.")
                    continue
                gpio = PIN_MAP[pin_fisico]
                if gpio in pines_ocupados:
                    print("❌ Ese pin (GPIO) ya está asignado a otro sensor.")
                    continue
                break
            except ValueError:
                print("❌ Entrada inválida. Ingresa un número.")

        alias = input(" ➤ Nombre o alias para este sensor (opcional): ").strip()

        # Validación obligatoria de token
        while True:
            token = input(" ➤ Ingresa el token del sensor: ").strip()

            if token in tokens_ocupados:
                print("❌ Este token ya está registrado. Ingresa uno distinto.")
                continue

            if not validar_token(token):
                print("❌ Token inválido. Este sensor no está autorizado.")
                retry = input("¿Deseas intentar con otro token? (s/n): ").strip().lower()
                if retry != "s":
                    token = None
                    break
            else:
                break

        if token is None:
            continue

        sensores.append({
            "id": f"sensor_{i}",
            "tipo": tipo,
            "gpio": gpio,
            "alias": alias,
            "token": token
        })

        pines_ocupados.add(gpio)
        tokens_ocupados.add(token)
        i += 1

        continuar = input("¿Deseas agregar otro sensor? (s/n): ").strip().lower()
        if continuar != "s":
            break
            
    return sensores

def guardar_config(sensores_nuevos):
    os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)

    sensores_existentes = []
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                sensores_existentes = json.load(f)
        except:
            pass  # Si falla la carga, parte vacío

    # Evitar duplicados por token o gpio
    tokens_existentes = {s["token"] for s in sensores_existentes}
    gpios_existentes = {s["gpio"] for s in sensores_existentes}

    sensores_filtrados = []
    for s in sensores_nuevos:
        if s["token"] in tokens_existentes:
            print(f"⚠️ Sensor con token {s['token']} ya existe, no se agregará.")
            continue
        if s["gpio"] in gpios_existentes:
            print(f"⚠️ Ya hay un sensor asignado al GPIO {s['gpio']}, no se agregará.")
            continue
        sensores_filtrados.append(s)

    sensores_totales = sensores_existentes + sensores_filtrados

    with open(CONFIG_FILE, "w") as f:
        json.dump(sensores_totales, f, indent=2)

    print(f"✅ Se guardaron {len(sensores_filtrados)} sensores nuevos (total: {len(sensores_totales)}).")


def main():
    print("┌────────────────────────────────────────────┐")
    print("│ Asistente de Configuración de Sensores    │")
    print("└────────────────────────────────────────────┘")
    sensores = obtener_sensores()
    if sensores:
        guardar_config(sensores)
    else:
        print("❗ No se configuró ningún sensor válido.")

if __name__ == "__main__":
    main()
