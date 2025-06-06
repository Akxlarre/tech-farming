# app/routes/predict_routes.py

import os
import pandas as pd
import joblib
from flask import Blueprint, request, jsonify
from datetime import timedelta, datetime

from app.config import Config
from app.queries.historial_queries import obtener_historial as helper_historial

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
def generar_features_desde_df(df_hist: pd.DataFrame):
    """
    - df_hist: DataFrame con al menos 6 filas (columnas: date (datetime), tempreature, humidity, N, P, K)
    - Devuelve un array 1×16 con las columnas en el orden correcto para el RF.
    """
    df = df_hist.copy().sort_values('date').reset_index(drop=True)

    # 1) Lags de temperatura (1h–6h)
    for lag in range(1, 7):
        df[f'tempreature_lag_{lag}h'] = df['tempreature'].shift(lag)

    # 2) Lags de humedad (1h–3h)
    for lag in range(1, 4):
        df[f'humidity_lag_{lag}h'] = df['humidity'].shift(lag)

    # 3) Lags de nutrientes (N, P, K a 1h)
    df['N_lag_1h'] = df['N'].shift(1)
    df['P_lag_1h'] = df['P'].shift(1)
    df['K_lag_1h'] = df['K'].shift(1)

    # 4) Deltas 1h
    df['temp_diff_1h'] = df['tempreature'] - df['tempreature'].shift(1)
    df['hum_diff_1h']  = df['humidity']  - df['humidity'].shift(1)

    # 5) Hour / Weekday
    df['hour']    = df['date'].dt.hour
    df['weekday'] = df['date'].dt.weekday

    # 6) Tomamos solo la última fila
    df_feat = df.iloc[-1:].copy()

    # 7) Columnas en el orden que espera el modelo
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
# 3) Endpoint GET /api/predict_influx
# ---------------------------------------------------
@predict_bp.route('/predict_influx', methods=['GET'])
def predict_from_influx():
    """
    - Parámetros esperados en query-string:
        invernaderoId (int, obligatorio),
        zonaId       (int, opcional),
        horas        (6, 12 o 24)
    - Recupera las últimas 24 horas (ventana horaria) de datos de Temperatura y Humedad
      en Influx, con window_every="1h", usando tu helper_historial.
    - Fusiona ambas series (temp + hum), rellena N,P,K=0.0, toma las últimas 6 filas,
      genera las 16 features y lanza el modelo RF multitarea para [6h,12h,24h].
    - Devuelve JSON con { historical, future, summary, trend }.
    """

    # 3.1) Leer y validar invernaderoId
    try:
        invernadero_id = int(request.args.get('invernaderoId'))
    except (TypeError, ValueError):
        return jsonify({"error": "invernaderoId inválido"}), 400

    # 3.2) Leer y validar zonaId (opcional)
    zona_id = request.args.get('zonaId')
    try:
        zona_id = int(zona_id) if zona_id not in (None, '') else None
    except ValueError:
        return jsonify({"error": "zonaId inválido"}), 400

    # 3.3) Leer y validar horas
    try:
        horas = int(request.args.get('horas'))
        if horas not in (6, 12, 24):
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "horas debe ser 6, 12 o 24"}), 400

    # 3.4) Construir el rango de consulta: desde = ahora - 24h, hasta = ahora
    ahora_dt = datetime.utcnow()
    desde_dt = ahora_dt - timedelta(hours=24)

    # *Importante:* para que Flux lo compile bien, lo pasamos a formato RFC3339 con 'Z':
    #   p. ej. "2025-06-06T05:31:33Z"
    desde_iso = desde_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    hasta_iso = ahora_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    # 3.5) Asegurarnos de que la conexión a InfluxDB existe
    if not Config.client:
        return jsonify({"error": "No hay conexión a InfluxDB"}), 500
    query_api = Config.client.query_api()

    # 3.6) Traer HISTORIAL de Temperatura
    try:
        hist_temp = helper_historial(
            query_api=query_api,
            bucket=Config.INFLUXDB_BUCKET,
            org=Config.INFLUXDB_ORG,
            invernadero_id=invernadero_id,
            tipo_parametro="Temperatura",
            desde=desde_iso,
            hasta=hasta_iso,
            zona_id=zona_id,
            sensor_id=None,
            window_every="1h"
        )
    except Exception as e:
        # Si Flux da “Bad Request” u otro error, devolvemos mensaje legible
        return jsonify({"error": f"Error al consultar Temperatura en InfluxDB: {e}"}), 500

    series_temp = hist_temp.get("series", [])
    if len(series_temp) < 6:
        return jsonify({"error": "No hay suficientes datos de temperatura (menos de 6 puntos horarios)."}), 400

    # 3.7) Traer HISTORIAL de Humedad
    try:
        hist_hum = helper_historial(
            query_api=query_api,
            bucket=Config.INFLUXDB_BUCKET,
            org=Config.INFLUXDB_ORG,
            invernadero_id=invernadero_id,
            tipo_parametro="Humedad",
            desde=desde_iso,
            hasta=hasta_iso,
            zona_id=zona_id,
            sensor_id=None,
            window_every="1h"
        )
    except Exception as e:
        return jsonify({"error": f"Error al consultar Humedad en InfluxDB: {e}"}), 500

    series_hum = hist_hum.get("series", [])
    if len(series_hum) < 6:
        return jsonify({"error": "No hay suficientes datos de humedad (menos de 6 puntos horarios)."}), 400

    # 3.8) Convertir ambas series a DataFrames de pandas y renombrar
    df_temp = (
        pd.DataFrame(series_temp)
          .rename(columns={"timestamp": "date", "value": "tempreature"})
    )
    df_temp['date'] = pd.to_datetime(df_temp['date'])

    df_hum = (
        pd.DataFrame(series_hum)
          .rename(columns={"timestamp": "date", "value": "humidity"})
    )
    df_hum['date'] = pd.to_datetime(df_hum['date'])

    # 3.9) Hacer merge inner por “date” para quedarnos solo con horas donde hay temp+hum
    df_hist = pd.merge(df_temp, df_hum, on='date', how='inner')

    # 3.10) Rellenar N, P, K con 0.0 (para que existan las columnas)
    df_hist['N'] = 0.0
    df_hist['P'] = 0.0
    df_hist['K'] = 0.0

    # 3.11) Verificar que tras el merge tenemos al menos 6 filas
    if len(df_hist) < 6:
        return jsonify({"error": "Tras combinar temp+hum faltan filas, menos de 6."}), 400

    # 3.12) Tomar las 6 últimas filas (cronológicamente)
    df_last6 = df_hist.sort_values('date').iloc[-6:].reset_index(drop=True)

    # 3.13) Generar las 16 features y predecir con rf_temp
    try:
        X_row = generar_features_desde_df(df_last6)
    except Exception as e:
        return jsonify({"error": f"Error al generar features: {e}"}), 500

    y_temp_pred = rf_temp.predict(X_row)[0]  # [pred_6h, pred_12h, pred_24h]

    # 3.14) Construir “historical” (sólo temperatura) con las 6 filas usadas
    historical = [
        {"timestamp": row['date'].isoformat(), "value": float(row['tempreature'])}
        for _, row in df_last6.iterrows()
    ]

    # 3.15) Construir “future” a partir de la última fecha +6h, +12h, +24h
    ultima_fecha = df_last6.iloc[-1]['date']
    future = [
        {"timestamp": (ultima_fecha + timedelta(hours=6)).isoformat(),  "value": float(y_temp_pred[0])},
        {"timestamp": (ultima_fecha + timedelta(hours=12)).isoformat(), "value": float(y_temp_pred[1])},
        {"timestamp": (ultima_fecha + timedelta(hours=24)).isoformat(), "value": float(y_temp_pred[2])}
    ]

    # 3.16) Armar summary y trend
    summary = {
        "updated": datetime.utcnow().isoformat(),
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

    # 3.17) Devolver el JSON final
    return jsonify({
        "historical": historical,
        "future":     future,
        "summary":    summary,
        "trend":      trend
    }), 200


# ---------------------------------------------------
# 4) Endpoint /api/test_predict → redirige a predict_influx
# ---------------------------------------------------
@predict_bp.route('/test_predict', methods=['GET'])
def test_predict():
    return predict_from_influx()
