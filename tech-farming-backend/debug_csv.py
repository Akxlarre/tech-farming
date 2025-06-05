# debug_csv.py

import os
import pandas as pd
from datetime import timedelta

# ----------------------------------------------------------
# Construimos la ruta completa al CSV basándonos en __file__
# ----------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH   = os.path.join(SCRIPT_DIR, 'IoT_subconjunto.csv')

def main():
    # 1) Leer el CSV SIN “parse_dates”
    print("Leyendo CSV sin parsear fechas (ruta absoluta):", CSV_PATH)
    try:
        df_all = pd.read_csv(CSV_PATH, dtype=str)  # Leemos todo como texto primero
    except FileNotFoundError as e:
        print("ERROR: no se encuentra el CSV en esa ruta:", e)
        return

    print("\nTipos después de read_csv (sin parsear):")
    print(df_all.dtypes, "\n")

    # 2) Mostrar las primeras filas tal como fueron leídas (para comprobar encabezados)
    print("Primeras 5 filas crudas:")
    print(df_all.head(), "\n")

    # 3) Convertir la columna 'date' a datetime64[ns]
    print("Convirtiendo columna 'date' a datetime con to_datetime(format='%Y-%m-%d %H:%M:%S')...")
    try:
        df_all['date'] = pd.to_datetime(df_all['date'], format='%Y-%m-%d %H:%M:%S')
    except Exception as e:
        print("ERROR al parsear las fechas:", e)
        return

    print("\nTipos después de pd.to_datetime:")
    print(df_all.dtypes, "\n")  # Ver que 'date' ahora sea datetime64[ns]

    # 4) Eliminar filas donde date = NaT
    nantes = df_all['date'].isna().sum()
    print(f"Filas con date=NaT (antes de dropear): {nantes}")
    if nantes > 0:
        df_all = df_all.dropna(subset=['date']).reset_index(drop=True)
        print(f"Filas con date=NaT eliminadas. Nuevo largo: {len(df_all)}")

    # 5) Ordenar cronológicamente (de más antiguo a más reciente)
    print("\nOrdenando por fecha ascendente...")
    df_all = df_all.sort_values('date').reset_index(drop=True)

    # 6) Mostrar las primeras y últimas filas para confirmar orden
    print("\nPrimeras 5 filas tras ordenar:")
    print(df_all.head()[['date', 'tempreature']], "\n")
    print("Últimas 5 filas tras ordenar:")
    print(df_all.tail()[['date', 'tempreature']], "\n")

    # 7) Extraer las últimas 6 filas (ventana de 6 horas más recientes)
    if len(df_all) < 6:
        print("ERROR: Hay menos de 6 filas en el CSV.")
        return

    df_hist = df_all.iloc[-6:].copy()
    print(">>> Ventana de 6 filas más recientes (df_hist):")
    print(df_hist[['date', 'tempreature']], "\n")

    # 8) Construir el JSON “historical” tal como lo haría tu endpoint
    historical = [
        {"timestamp": row['date'].isoformat(), "value": float(row['tempreature'])}
        for _, row in df_hist.iterrows()
    ]
    print(">>> Resultado de `historical` (lista de dicts con ISO timestamps):")
    print(historical, "\n")

    # 9) Simular llamada al modelo para generar 3 valores de ejemplo
    ultima_fecha = df_hist.iloc[-1]['date']
    future = [
        {"timestamp": (ultima_fecha + timedelta(hours=6)).isoformat(),  "value": 0.0},
        {"timestamp": (ultima_fecha + timedelta(hours=12)).isoformat(), "value": 0.0},
        {"timestamp": (ultima_fecha + timedelta(hours=24)).isoformat(), "value": 0.0}
    ]
    print(">>> Resultado de `future` (lista de dicts con ISO timestamps):")
    print(future)

if __name__ == '__main__':
    main()
