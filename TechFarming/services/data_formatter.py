import time

def formatear_datos(sensor_data):
    """
    Convierte un dict crudo del sensor en lista de mediciones estandarizadas
    {
        "token": "abc123",
        "temperatura": 25.1,
        "humedad": 60.3,
        ...
    }
    =>
    {
        "token": "abc123",
        "timestamp": 1720000000.00,
        "mediciones": [
            {"parametro": "temperatura", "valor": 25.1, "timestamp": 1720000000.00},
            {"parametro": "humedad", "valor": 60.3, "timestamp": 1720000000.00}
        ]
    }
    """
    resultado = {
        "token": sensor_data.get("token"),
        "mediciones": []
    }

    timestamp = sensor_data.get("timestamp", time.time())
    if not timestamp:
        from datetime import datetime
        from zoneinfo import ZoneInfo
        timestamp = datetime.now(ZoneInfo("America/Santiago")).isoformat()
        
    for clave, valor in sensor_data.items():
        if clave in ["token", "tipo", "alias", "gpio", "timestamp", "error"]:
            continue
        if valor is not None:
            resultado["mediciones"].append({
                "parametro": clave,
                "valor": valor,
                "timestamp": timestamp
            })
    return resultado
