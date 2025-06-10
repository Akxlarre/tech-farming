# 🌱 Tech Farming - Plataforma IoT para Agricultura de Precisión

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-En%20Desarrollo-yellow.svg)]()
[![Angular](https://img.shields.io/badge/frontend-Angular-DD0031?logo=angular)]()
[![Backend](https://img.shields.io/badge/backend-Flask-000000?logo=flask)]()
[![Database](https://img.shields.io/badge/database-InfluxDB-blue?logo=influxdb)]()

---

## 🧠 Descripción

**Tech Farming** es un proyecto MVP universitario que busca apoyar a los pequeños y medianos agricultores mediante una **plataforma IoT** que permite **monitorear variables críticas de cultivo en invernaderos**.

La solución integra lectura de sensores que miden:
- 🌡️ Temperatura
- 💧 Humedad relativa
- 💧 Nivel de agua
- 🌿 Nutrientes del suelo (Nitrógeno, Fósforo, Potasio)
- 📅 Fecha y hora (timestamp)

---

## 🚀 Tecnologías Utilizadas

| Stack       | Herramientas |
|-------------|--------------|
| **Frontend** | Angular, TailwindCSS (opcional), Angular Material |
| **Backend**  | Python + Flask, Flask-RESTful, JWT, SQLAlchemy |
| **Base de Datos** | PostgreSQL (estructura), InfluxDB (series temporales) |
| **Visualización** | Chart.js, ngx-charts, ApexCharts (por definir) |
| **Machine Learning** | Scikit-learn (regresión / clasificación básica) |
| **DevOps**   | Git, GitHub, Trello (SCRUM), documentación Notion |

---


## 📊 Módulos de la Aplicación

✅ **MVP incluye:**

- Panel de control (dashboard) con visualización en tiempo real.
- Sistema de alertas por umbrales o predicción.
- Gestión de sensores e invernaderos.
- Registro/login de usuarios.
- Reportes históricos por parámetro.

📌 **Futuras mejoras:**

- Automatización de riego/fertilización.
- Integración con APIs climáticas.
- Predicción avanzada con LSTM o Random Forest.

---

## 📒 Backend

Algunas alertas históricas se generaron antes de contar con el campo
`sensor_id`. Por compatibilidad, el listado verifica tanto `Alerta.sensor_id`
como el sensor asociado al `sensor_parametro` cuando se filtra por sensor.
