import requests
import pandas as pd
import time
from datetime import datetime
API_URL = "http://localhost:5000/api/sensores/datos" 
SENSOR_ID = 4  

df = pd.read_csv("//home/akxlarre/Escritorio/IoTProcessed_Data.csv")


if 'tempreature' in df.columns:
    df.rename(columns={'tempreature': 'temperature'}, inplace=True)


parametros_usados = ["temperature", "humidity", "water_level", "N", "P", "K"]


for index, row in df.iterrows():
    mediciones = []
    for parametro in parametros_usados:
        if pd.notnull(row[parametro]):
            mediciones.append({
                "parametro": parametro,
                "valor": float(row[parametro])
            })

    payload = {
        "sensor_id": SENSOR_ID,
        "mediciones": mediciones
    }

    print(f"🔄 Enviando fila {index + 1}...")
    response = requests.post(API_URL, json=payload)

    if response.status_code == 200:
        print("✅ Datos enviados correctamente")
    else:
        print(f" Error {response.status_code}: {response.text}")

    time.sleep(2)  