# app/routes/predict_routes.py

import os
import pandas as pd
import joblib
from flask import Blueprint, request, jsonify
from datetime import timedelta, datetime

from app.config import Config
from app.queries.prediction_queries import obtener_serie_prediccion

predict_bp = Blueprint('predict', __name__, url_prefix='/api')

# ---------------------------------------------------
# 1) Carga del modelo RandomForest multitarea para temperatura
# ---------------------------------------------------
BASE_DIR         = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
MODEL_TEMP_PATH  = os.path.join(BASE_DIR, 'modelo_rf_temp.pkl')

try:
    rf_temp = joblib.load(MODEL_TEMP_PATH)
except FileNotFoundError:
    raise FileNotFoundError(f"No se encontró el modelo en {MODEL_TEMP_PATH!r}")

# ---------------------------------------------------
# 2) Función para generar las 16 features desde un DataFrame de 6 filas
# ---------------------------------------------------
def generar_features_desde_df(df_hist: pd.DataFrame) -> pd.DataFrame:
    df = df_hist.copy().sort_values('date').reset_index(drop=True)
    # (generación de lags, diffs, hour, weekday)
    for lag in range(1, 7):
        df[f'tempreature_lag_{lag}h'] = df['tempreature'].shift(lag)
    for lag in range(1, 4):
        df[f'humidity_lag_{lag}h'] = df['humidity'].shift(lag)
    df['N_lag_1h'] = df['N'].shift(1)
    df['P_lag_1h'] = df['P'].shift(1)
    df['K_lag_1h'] = df['K'].shift(1)
    df['temp_diff_1h'] = df['tempreature'] - df['tempreature'].shift(1)
    df['hum_diff_1h']  = df['humidity']  - df['humidity'].shift(1)
    df['hour']    = df['date'].dt.hour
    df['weekday'] = df['date'].dt.weekday

    df_feat = df.iloc[-1:].copy()
    feature_cols = [
        'tempreature_lag_1h','tempreature_lag_2h','tempreature_lag_3h',
        'tempreature_lag_4h','tempreature_lag_5h','tempreature_lag_6h',
        'humidity_lag_1h','humidity_lag_2h','humidity_lag_3h',
        'N_lag_1h','P_lag_1h','K_lag_1h',
        'temp_diff_1h','hum_diff_1h','hour','weekday'
    ]
    faltantes = [c for c in feature_cols if c not in df_feat.columns]
    if faltantes:
        raise ValueError(f"Faltan columnas para features: {faltantes}")
    return df_feat[feature_cols]

# ---------------------------------------------------
# 3) Endpoint GET /api/predict_influx
# ---------------------------------------------------
@predict_bp.route('/predict_influx', methods=['GET'])
def predict_from_influx():
    print("← predict_influx args:", request.args.to_dict())

    # Validar invernaderoId y zonaId y horas…
    try:
        invernadero_id = int(request.args.get('invernaderoId'))
    except:
        return jsonify({"error": "invernaderoId inválido"}), 400
    zona_id = request.args.get('zonaId')
    try:
        zona_id = int(zona_id) if zona_id not in (None, '') else None
    except:
        return jsonify({"error": "zonaId inválido"}), 400
    try:
        horas = int(request.args.get('horas'))
        if horas not in (6,12,24): raise
    except:
        return jsonify({"error": "horas debe ser 6, 12 o 24"}), 400

    ahora_dt  = datetime.utcnow()
    desde_iso = (ahora_dt - timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")
    hasta_iso =  ahora_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    if not Config.client:
        return jsonify({"error": "No hay conexión a InfluxDB"}), 500
    query_api = Config.client.query_api()

    # Serie de Temperatura usando helper específico
    hist_temp = obtener_serie_prediccion(
        query_api, Config.INFLUXDB_BUCKET, Config.INFLUXDB_ORG,
        invernadero_id, "Temperatura", desde_iso, hasta_iso,
        zona_id, None, window_every="1h"
    )
    series_temp = hist_temp["series"]
    if len(series_temp) < 6:
        return jsonify({"error": "Menos de 6 puntos de temperatura."}), 400

    # Serie de Humedad
    hist_hum = obtener_serie_prediccion(
        query_api, Config.INFLUXDB_BUCKET, Config.INFLUXDB_ORG,
        invernadero_id, "Humedad", desde_iso, hasta_iso,
        zona_id, None, window_every="1h"
    )
    series_hum = hist_hum["series"]
    if len(series_hum) < 6:
        return jsonify({"error": "Menos de 6 puntos de humedad."}), 400

    # Preparar DataFrame para features
    df_temp = pd.DataFrame(series_temp).rename(columns={"timestamp":"date","value":"tempreature"})
    df_temp['date'] = pd.to_datetime(df_temp['date'])
    df_hum  = pd.DataFrame(series_hum ).rename(columns={"timestamp":"date","value":"humidity"})
    df_hum['date']  = pd.to_datetime(df_hum['date'])
    df_hist = pd.merge(df_temp, df_hum, on='date', how='inner')
    df_hist[['N','P','K']] = 0.0
    df_last6 = df_hist.sort_values('date').iloc[-6:].reset_index(drop=True)

    # Features y predicción
    X_row       = generar_features_desde_df(df_last6)
    y_temp_pred = rf_temp.predict(X_row)[0]

    # Respuesta JSON: usar hist_temp series completas para gráfico
    historical = [
        {"timestamp": p["timestamp"], "value": p["value"]}
        for p in hist_temp["series"]
    ]
    ultima_fecha = df_last6.iloc[-1]['date']
    future = [
      {"timestamp": (ultima_fecha + timedelta(hours=6 )).isoformat(),"value":float(y_temp_pred[0])},
      {"timestamp": (ultima_fecha + timedelta(hours=12)).isoformat(),"value":float(y_temp_pred[1])},
      {"timestamp": (ultima_fecha + timedelta(hours=24)).isoformat(),"value":float(y_temp_pred[2])}
    ]

    summary = {"updated": datetime.utcnow().isoformat(),
               "text": f"Predicción de {horas} horas para invernadero {invernadero_id}"}
    avg_hist = sum(p["value"] for p in historical)/len(historical)
    avg_fut  = sum(p["value"] for p in future)/len(future)
    diff_pct = ((avg_fut-avg_hist)/avg_hist)*100
    trend = {
      "text":       "Tendencia al alza" if diff_pct>=0 else "Tendencia a la baja",
      "comparison": f"{abs(diff_pct):.1f}%",
      "icon":       "arrow-up" if diff_pct>=0 else "arrow-down",
      "color":      "success" if diff_pct>=0 else "warning"
    }

    return jsonify({
      "historical": historical,
      "future":     future,
      "summary":    summary,
      "trend":      trend
    }), 200

@predict_bp.route('/test_predict', methods=['GET'])
def test_predict():
    return predict_from_influx()
