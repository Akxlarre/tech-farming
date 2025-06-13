# app/routes/predict_routes.py

import os
import pandas as pd
import joblib
from flask import Blueprint, request, jsonify
from datetime import timedelta, datetime
from zoneinfo import ZoneInfo

from app.config import Config
from app.queries.prediction_queries import obtener_serie_prediccion

predict_bp = Blueprint('predict', __name__, url_prefix='/api')

# ---------------------------------------------------
# 1) Carga de los tres modelos RF
# ---------------------------------------------------
BASE_DIR        = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
MODEL_TEMP_PATH = os.path.join(BASE_DIR, 'modelo_rf_temp.pkl')
MODEL_HUM_PATH  = os.path.join(BASE_DIR, 'modelo_rf_hum.pkl')
MODEL_NUT_PATH  = os.path.join(BASE_DIR, 'modelo_rf_nut.pkl')

rf_temp = joblib.load(MODEL_TEMP_PATH)
rf_hum  = joblib.load(MODEL_HUM_PATH)
rf_nut  = joblib.load(MODEL_NUT_PATH)


# ---------------------------------------------------
# 2) Generar features a partir de df con columnas:
#    date, tempreature, humidity, N, P, K
# ---------------------------------------------------
def generar_features_desde_df(df: pd.DataFrame) -> pd.DataFrame:
    # df must have 'date','tempreature','humidity','N','P','K'
    df = df.sort_values('date').reset_index(drop=True)
    # 1) Lags temperatura
    for lag in range(1,7):
        df[f'tempreature_lag_{lag}h'] = df['tempreature'].shift(lag)
    # 2) Lags humedad
    for lag in range(1,4):
        df[f'humidity_lag_{lag}h'] = df['humidity'].shift(lag)
    # 3) Lags nutrientes
    df['N_lag_1h'] = df['N'].shift(1)
    df['P_lag_1h'] = df['P'].shift(1)
    df['K_lag_1h'] = df['K'].shift(1)
    # 4) Deltas 1h
    df['temp_diff_1h'] = df['tempreature'] - df['tempreature'].shift(1)
    df['hum_diff_1h']  = df['humidity']  - df['humidity'].shift(1)
    # 5) Hour / Weekday
    df['hour']    = df['date'].dt.hour
    df['weekday'] = df['date'].dt.weekday

    # Tomar última fila
    df_feat = df.iloc[-1:].copy()
    cols = [
        'tempreature_lag_1h','tempreature_lag_2h','tempreature_lag_3h',
        'tempreature_lag_4h','tempreature_lag_5h','tempreature_lag_6h',
        'humidity_lag_1h','humidity_lag_2h','humidity_lag_3h',
        'N_lag_1h','P_lag_1h','K_lag_1h',
        'temp_diff_1h','hum_diff_1h','hour','weekday'
    ]
    missing = [c for c in cols if c not in df_feat.columns]
    if missing:
        raise ValueError(f"Faltan columnas para features: {missing}")
    return df_feat[cols]


# ---------------------------------------------------
# 3) Endpoint GET /api/predict_influx
# ---------------------------------------------------
@predict_bp.route('/predict_influx', methods=['GET'])
def predict_from_influx():
    args = request.args.to_dict()
    print("← predict_influx args:", args)

    # Validación de invernaderoId
    try:
        inv_id = int(request.args.get('invernaderoId'))
    except:
        return jsonify({"error": "invernaderoId inválido"}), 400

    # Validación de zonaId
    z = request.args.get('zonaId')
    try:
        zona_id = int(z) if z not in (None, '') else None
    except:
        return jsonify({"error": "zonaId inválido"}), 400

    # Validación de horas
    try:
        horas = int(request.args.get('horas'))
        if horas not in (6,12,24):
            raise ValueError
    except:
        return jsonify({"error": "horas debe ser 6, 12 o 24"}), 400

    # Validación de parámetro
    parametro = request.args.get('parametro')
    validos = ("Temperatura","Humedad","N","P","K")
    if parametro not in validos:
        return jsonify({"error": f"parametro inválido (elegir uno de {validos})"}), 400

    # Rango de consulta: últimas 24h
    now = datetime.now(ZoneInfo("America/Santiago"))
    desde = (now - timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")
    hasta =  now.strftime("%Y-%m-%dT%H:%M:%SZ")

    # Conexión Influx
    if not Config.client:
        return jsonify({"error":"No hay conexión a InfluxDB"}),500
    api = Config.client.query_api()

    # Serie para el gráfico (el parámetro elegido)
    hist_param = obtener_serie_prediccion(
        api, Config.INFLUXDB_BUCKET, Config.INFLUXDB_ORG,
        inv_id, parametro, desde, hasta,
        zona_id, None, window_every="1h"
    )
    series_param = hist_param["series"]
    if len(series_param) < 6:
        return jsonify({"error":f"Menos de 6 puntos de {parametro.lower()}"}),400

    # Series separadas para features: temperatura + humedad
    hist_temp = obtener_serie_prediccion(
        api, Config.INFLUXDB_BUCKET, Config.INFLUXDB_ORG,
        inv_id, "Temperatura", desde, hasta,
        zona_id, None, window_every="1h"
    )
    hist_hum  = obtener_serie_prediccion(
        api, Config.INFLUXDB_BUCKET, Config.INFLUXDB_ORG,
        inv_id, "Humedad", desde, hasta,
        zona_id, None, window_every="1h"
    )

    # DataFrames de temp y hum
    df_temp = pd.DataFrame(hist_temp["series"])\
                .rename(columns={"timestamp":"date","value":"tempreature"})
    df_temp['date'] = pd.to_datetime(df_temp['date'])
    df_hum  = pd.DataFrame(hist_hum["series"])\
                .rename(columns={"timestamp":"date","value":"humidity"})
    df_hum['date'] = pd.to_datetime(df_hum['date'])

    # Merge y añadir N,P,K=0
    df = pd.merge(df_temp, df_hum, on='date', how='inner')
    df[['N','P','K']] = 0.0

    # Últimas 6 filas para features
    df6 = df.sort_values('date').iloc[-6:].reset_index(drop=True)

    # Selección de modelo
    if parametro == "Temperatura":
        model = rf_temp; mname="modelo_rf_temp.pkl"
    elif parametro == "Humedad":
        model = rf_hum;  mname="modelo_rf_hum.pkl"
    else:
        model = rf_nut;  mname="modelo_rf_nut.pkl"
    print(f"🐞 Usando {mname} para {parametro}")

    # Generar features y predecir
    X = generar_features_desde_df(df6)
    y = model.predict(X)[0]  # [6h,12h,24h]

    # Construir historical completa y future
    historical = [
        {"timestamp": p["timestamp"], "value": p["value"]}
        for p in series_param
    ]
    last_date = df6.iloc[-1]['date']
    future = [
        {"timestamp": (last_date + timedelta(hours=6 )).isoformat(),  "value": float(y[0])},
        {"timestamp": (last_date + timedelta(hours=12)).isoformat(), "value": float(y[1])},
        {"timestamp": (last_date + timedelta(hours=24)).isoformat(), "value": float(y[2])}
    ]

    # Summary & trend
    avg_hist = sum(p["value"] for p in historical) / len(historical)
    avg_fut  = sum(p["value"] for p in future)     / len(future)
    diff_pct = ((avg_fut-avg_hist)/avg_hist)*100
    summary = {
        "updated": datetime.now(ZoneInfo("America/Santiago")).isoformat(),
        "text":    f"Predicción de {horas}h de {parametro} en inv.{inv_id}",
        "model":   mname
    }
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
