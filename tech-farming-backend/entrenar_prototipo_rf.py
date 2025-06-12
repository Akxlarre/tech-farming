import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np
import joblib
import os

base_dir = os.path.dirname(__file__)
csv_path = os.path.join(base_dir, 'IoT_subconjunto.csv')
# 1. Preprocesamiento (igual que lo tenías): lectura, lags, deltas, dropna, split 70/30
df = pd.read_csv(csv_path, parse_dates=['date'])
df = df.sort_values('date')

# (a) Generar lags de temp, hum, N/P/K y deltas, hour, weekday…
for lag in range(1, 7):
    df[f'tempreature_lag_{lag}h'] = df['tempreature'].shift(lag)
for lag in range(1, 4):
    df[f'humidity_lag_{lag}h'] = df['humidity'].shift(lag)
for var in ['N', 'P', 'K']:
    df[f'{var}_lag_1h'] = df[var].shift(1)

df['temp_diff_1h'] = df['tempreature'] - df['tempreature'].shift(1)
df['hum_diff_1h']  = df['humidity']  - df['humidity'].shift(1)
df['hour']    = df['date'].dt.hour
df['weekday'] = df['date'].dt.weekday

# Targets
for var in ['tempreature', 'humidity', 'N', 'P', 'K']:
    df[f'{var}_6h']  = df[var].shift(-6)
    df[f'{var}_12h'] = df[var].shift(-12)
    df[f'{var}_24h'] = df[var].shift(-24)

df = df.dropna().reset_index(drop=True)

# Features comunes (sin target)
feature_cols = [col for col in df.columns if '_lag_' in col] + [
    'temp_diff_1h', 'hum_diff_1h', 'hour', 'weekday'
]

# 👉 Imprime aquí las columnas que usarás como entrada X:
print("Columnas de entrada (feature_cols):")
for c in feature_cols:
    print("   ", c)
print(f"\nTotal de columnas de entrada (X): {len(feature_cols)}\n")

X = df[feature_cols]

# Subdividir los targets
y_temp = df[['tempreature_6h','tempreature_12h','tempreature_24h']]
y_hum  = df[['humidity_6h','humidity_12h','humidity_24h']]
y_nut  = df[['N_6h','P_6h','K_6h']]  # o multitarea si quieres más horizontes

# División cronológica 70 % / 30 %
n       = len(df)
n_train = int(0.7 * n)
X_train, X_test = X.iloc[:n_train], X.iloc[n_train:]
y_temp_train, y_temp_test = y_temp.iloc[:n_train], y_temp.iloc[n_train:]
y_hum_train,  y_hum_test  = y_hum.iloc[:n_train],  y_hum.iloc[n_train:]
y_nut_train,  y_nut_test  = y_nut.iloc[:n_train],  y_nut.iloc[n_train:]

# 2. MODELO TEMPERATURA: Random Forest multitarea
rf_temp = RandomForestRegressor(
    n_estimators=20,
    max_depth=8,
    min_samples_leaf=5,
    random_state=42
)
rf_temp.fit(X_train, y_temp_train)

# 3. MODELO HUMEDAD: RandomForest multitarea
rf_hum = RandomForestRegressor(
    n_estimators=30,
    max_depth=12,
    max_features='sqrt',
    min_samples_leaf=5,
    random_state=42
)
rf_hum.fit(X_train, y_hum_train)

# 4. MODELO NUTRIENTES: RandomForest multitarea
rf_nut = RandomForestRegressor(
    n_estimators=20,
    max_depth=None,
    min_samples_leaf=3,
    random_state=42
)
rf_nut.fit(X_train, y_nut_train)

# 5. PREDICCIÓN Y EVALUACIÓN (opcional)
print("--- Evaluación Temperatura (RF) ---")
y_pred_temp = rf_temp.predict(X_test)
for idx, col in enumerate(y_temp.columns):
    mae  = mean_absolute_error(y_temp_test[col], y_pred_temp[:, idx])
    rmse = np.sqrt(mean_squared_error(y_temp_test[col], y_pred_temp[:, idx]))
    r2   = r2_score(y_temp_test[col], y_pred_temp[:, idx])
    print(f"{col}: MAE={mae:.3f}, RMSE={rmse:.3f}, R2={r2:.3f}")

print("\n--- Evaluación Humedad (RF) ---")
y_pred_hum = rf_hum.predict(X_test)
for idx, col in enumerate(y_hum.columns):
    mae  = mean_absolute_error(y_hum_test[col], y_pred_hum[:, idx])
    rmse = np.sqrt(mean_squared_error(y_hum_test[col], y_pred_hum[:, idx]))
    r2   = r2_score(y_hum_test[col], y_pred_hum[:, idx])
    print(f"{col}: MAE={mae:.3f}, RMSE={rmse:.3f}, R2={r2:.3f}")

print("\n--- Evaluación Nutrientes (RF) ---")
y_pred_nut = rf_nut.predict(X_test)
for idx, col in enumerate(y_nut.columns):
    mae  = mean_absolute_error(y_nut_test[col], y_pred_nut[:, idx])
    rmse = np.sqrt(mean_squared_error(y_nut_test[col], y_pred_nut[:, idx]))
    r2   = r2_score(y_nut_test[col], y_pred_nut[:, idx])
    print(f"{col}: MAE={mae:.3f}, RMSE={rmse:.3f}, R2={r2:.3f}")

# 6. Guardar los modelos en disco (si quieres reusar en Flask)
# joblib.dump(rf_temp, 'modelo_rf_temp.pkl')
# joblib.dump(rf_hum,  'modelo_rf_hum.pkl')
# joblib.dump(rf_nut,  'modelo_rf_nut.pkl')
