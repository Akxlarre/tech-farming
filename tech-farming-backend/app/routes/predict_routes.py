# app/routes/predict_routes.py

import os
import pandas as pd
import joblib
from flask import Blueprint, request, jsonify
from datetime import timedelta

predict_bp = Blueprint('predict', __name__, url_prefix='/api')

# ---------------------------------------------------
# Rutas absolutas al modelo .pkl y al CSV
# ---------------------------------------------------
BASE_DIR        = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
MODEL_TEMP_PATH = os.path.join(BASE_DIR, 'modelo_rf_temp.pkl')
CSV_PATH        = os.path.join(BASE_DIR, 'IoT_subconjunto.csv')

# Carga del modelo RandomForest para temperatura (multitarea 6h, 12h, 24h)
try:
    rf_temp = joblib.load(MODEL_TEMP_PATH)
except FileNotFoundError:
    raise FileNotFoundError(f"No se encontró el modelo en {MODEL_TEMP_PATH!r}")


# ---------------------------------------------------
# Función para generar exactamente las 16 features
# ---------------------------------------------------
def generar_features_desde_df(df_hist: pd.DataFrame):
    """
    Recibe un DataFrame `df_hist` con al menos 6 filas (date como datetime + temp, hum, N, P, K ya NUMÉRICOS).
    Devuelve un array (1×16) con las 16 columnas (lags, deltas, hora, weekday) en el orden exacto que requiere el modelo.
    """
    df = df_hist.copy().sort_values('date').reset_index(drop=True)

    # 1) Lags de temperatura (1h a 6h)
    for lag in range(1, 7):
        df[f'tempreature_lag_{lag}h'] = df['tempreature'].shift(lag)

    # 2) Lags de humedad (1h a 3h)
    for lag in range(1, 4):
        df[f'humidity_lag_{lag}h'] = df['humidity'].shift(lag)

    # 3) Lags de nutrientes (lag de 1h para N, P, K)
    df['N_lag_1h'] = df['N'].shift(1)
    df['P_lag_1h'] = df['P'].shift(1)
    df['K_lag_1h'] = df['K'].shift(1)

    # 4) Deltas de 1h
    df['temp_diff_1h'] = df['tempreature'] - df['tempreature'].shift(1)
    df['hum_diff_1h']  = df['humidity']  - df['humidity'].shift(1)

    # 5) Variables temporales
    df['hour']    = df['date'].dt.hour
    df['weekday'] = df['date'].dt.weekday

    # 6) Tomar solo la última fila, que ya contiene todos los lags y variables
    df_feat = df.iloc[-1:].copy()

    # 7) Columnas que el modelo espera (16 en total)
    feature_cols = [
        'tempreature_lag_1h',
        'tempreature_lag_2h',
        'tempreature_lag_3h',
        'tempreature_lag_4h',
        'tempreature_lag_5h',
        'tempreature_lag_6h',
        'humidity_lag_1h',
        'humidity_lag_2h',
        'humidity_lag_3h',
        'N_lag_1h',
        'P_lag_1h',
        'K_lag_1h',
        'temp_diff_1h',
        'hum_diff_1h',
        'hour',
        'weekday'
    ]

    faltantes = [c for c in feature_cols if c not in df_feat.columns]
    if faltantes:
        raise ValueError(f"Faltan columnas para features: {faltantes}")

    X_row = df_feat[feature_cols].values.reshape(1, -1)
    return X_row


# ---------------------------------------------------
# Endpoint GET /api/predict_influx usando datos del CSV
# ---------------------------------------------------
@predict_bp.route('/predict_influx', methods=['GET'])
def predict_from_csv():
    """
    - Lee el CSV completo (sin parsear fechas inicialmente).
    - Convierte 'date' a datetime64, elimina filas con NaT, ordena por fecha.
    - Convierte las columnas numéricas (temp, hum, N, P, K) a float.
    - Hace resample cada 1H y toma la última lectura de cada hora.
    - Extrae las últimas 6 filas (6 horas más recientes).
    - Construye 'historical' con esas 6 temperaturas.
    - Genera features y predice [6h, 12h, 24h] con rf_temp.
    - Construye 'future' a partir de la última fecha +6h, +12h, +24h.
    - Devuelve JSON: { historical, future, summary, trend }.
    """
    # 1) Leer parámetros query
    try:
        invernadero_id = int(request.args.get('invernaderoId'))
    except (TypeError, ValueError):
        return jsonify({"error": "invernaderoId inválido"}), 400

    zona_id = request.args.get('zonaId')
    try:
        zona_id = int(zona_id) if zona_id is not None else None
    except ValueError:
        return jsonify({"error": "zonaId inválido"}), 400

    try:
        horas = int(request.args.get('horas'))
        if horas not in (6, 12, 24):
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "horas debe ser 6, 12 o 24"}), 400

    # 2) Leer TODO el CSV sin parsear fechas
    try:
        df_all = pd.read_csv(CSV_PATH, dtype=str)
    except FileNotFoundError:
        return jsonify({"error": f"No se encontró el CSV en {CSV_PATH!r}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error al leer CSV: {e}"}), 500

    # 3) Convertir 'date' a datetime64[ns] con el formato exacto de tu CSV
    try:
        df_all['date'] = pd.to_datetime(df_all['date'], format='%Y-%m-%d %H:%M:%S')
    except Exception as e:
        return jsonify({"error": f"Fallo al parsear 'date': {e}"}), 500

    # 4) Eliminar filas donde date sea NaT (no válido)
    df_all = df_all.dropna(subset=['date']).reset_index(drop=True)

    # 5) Convertir las columnas numéricas de texto (object) a float
    #    De esta manera podemos hacer sumas, restas, shifts, etc.
    try:
        df_all['tempreature'] = pd.to_numeric(df_all['tempreature'], errors='coerce')
        df_all['humidity']    = pd.to_numeric(df_all['humidity'], errors='coerce')
        df_all['N']           = pd.to_numeric(df_all['N'], errors='coerce')
        df_all['P']           = pd.to_numeric(df_all['P'], errors='coerce')
        df_all['K']           = pd.to_numeric(df_all['K'], errors='coerce')
    except Exception as e:
        return jsonify({"error": f"Fallo al convertir columnas numéricas: {e}"}), 500

    # 6) También eliminamos filas donde cualquiera de esas 5 columnas numéricas resultó en NaN
    df_all = df_all.dropna(subset=['tempreature','humidity','N','P','K']).reset_index(drop=True)

    # 7) Ordenar cronológicamente por 'date'
    df_all = df_all.sort_values('date').reset_index(drop=True)

    # 8) Resample horaria: tomar la última lectura de cada hora
    df_hourly = (
        df_all
        .set_index('date')
        .resample('1H')                     # agrupa cada hora calendario
        .last()                             # toma la última lectura disponible en esa hora
        .dropna(subset=['tempreature'])     # elimina horas sin dato de tempreature
        .reset_index()
    )

    # 9) Asegurarse de que hay al menos 6 filas (6 horas)
    if len(df_hourly) < 6:
        return jsonify({"error": "Menos de 6 horas disponibles en el CSV."}), 400

    # 10) Tomar las últimas 6 filas (6 horas más recientes)
    df_hist = df_hourly.iloc[-6:].copy()

    # 11) Construir 'historical' con las 6 temperaturas
    historical = [
        {"timestamp": row['date'].isoformat(), "value": float(row['tempreature'])}
        for _, row in df_hist.iterrows()
    ]

    # 12) Generar features y predecir
    try:
        X_row = generar_features_desde_df(df_hist)
    except Exception as e:
        return jsonify({"error": f"Error al generar features: {e}"}), 500

    y_temp_pred = rf_temp.predict(X_row)[0]  # [pred_6h, pred_12h, pred_24h]

    # 13) Construir 'future' (a partir de la última fecha válida)
    ultima_fecha = df_hist.iloc[-1]['date']
    future = [
        {"timestamp": (ultima_fecha + timedelta(hours=6)).isoformat(),  "value": float(y_temp_pred[0])},
        {"timestamp": (ultima_fecha + timedelta(hours=12)).isoformat(), "value": float(y_temp_pred[1])},
        {"timestamp": (ultima_fecha + timedelta(hours=24)).isoformat(), "value": float(y_temp_pred[2])}
    ]

    # 14) Construir summary y trend
    summary = {
        "updated": pd.Timestamp.now().isoformat(),
        "text":    f"Predicción de {horas} horas para invernadero {invernadero_id}"
    }

    avg_hist = sum(p["value"] for p in historical) / len(historical)
    avg_fut  = sum(p["value"] for p in future) / len(future)
    diff_pct = ((avg_fut - avg_hist) / avg_hist) * 100
    trend = {
        "text":       "Tendencia al alza" if diff_pct >= 0 else "Tendencia a la baja",
        "comparison": f"{abs(diff_pct):.1f}%",
        "icon":       "arrow-up" if diff_pct >= 0 else "arrow-down",
        "color":      "success" if diff_pct >= 0 else "warning"
    }

    # 15) Devolver JSON
    return jsonify({
        "historical": historical,
        "future":     future,
        "summary":    summary,
        "trend":      trend
    }), 200


# ---------------------------------------------------
# Endpoint de prueba /api/test_predict → redirige a predict_influx
# ---------------------------------------------------
@predict_bp.route('/test_predict', methods=['GET'])
def test_predict():
    return predict_from_csv()
