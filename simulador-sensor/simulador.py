import os
import sys
import requests
import pandas as pd
import time

API_URL = "http://localhost:5000/api/sensores/datos"
SENSOR_TOKEN = "977f72b5545dace58664f27299844063"

# 1) Carga el CSV y muestra sus columnas
csv_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "IoTProcessed_Data.csv")
df = pd.read_csv(csv_path)
print("Columnas originales:", df.columns.tolist())

# 2) Renombrado de columnas según cómo vengan en tu CSV
if 'tempreature' in df.columns:
    df.rename(columns={'tempreature': 'Temperatura'}, inplace=True)
if 'humidity' in df.columns:
    df.rename(columns={'humidity': 'Humedad'}, inplace=True)

# 3) Parámetros que vas a enviar
parametros_usados = ['Temperatura', 'Humedad']

# 4) Itera fila por fila
for index, row in df.iterrows():
    mediciones = []
    for parametro in parametros_usados:
        # Verifica que la columna exista y no sea NaN
        if parametro in row.index and pd.notnull(row[parametro]):
            mediciones.append({
                'parametro': parametro,
                'valor':     float(row[parametro])
            })

    payload = {
        'token':       SENSOR_TOKEN,
        'mediciones':  mediciones
    }

    print(f"🔄 Enviando fila {index+1} con columnas {list(row.index)}")
    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        print("✅ Datos enviados correctamente")
    except requests.HTTPError as e:
        print(f"❌ HTTP {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

    # 5) Espera 2 segundos antes de la siguiente iteración
    time.sleep(2)
