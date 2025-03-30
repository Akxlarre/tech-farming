from flask import Blueprint, request, jsonify
import logging
from app.config import escribir_dato

# Configurar logging
logging.basicConfig(level=logging.INFO)

# Crear el Blueprint
sensores_bp = Blueprint('sensores', __name__)

@sensores_bp.route('/datos', methods=['POST'])
def recibir_datos_sensores():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se recibió JSON válido"}), 400

        # Extraer datos del JSON
        sensor_id = data.get("sensor_id")
        tipo_sensor = data.get("tipo_sensor")
        invernadero_id = data.get("invernadero_id")
        zona = data.get("zona")
        valor = data.get("valor")
        unidad = data.get("unidad", None)
        pos_x = data.get("pos_x", None)
        pos_y = data.get("pos_y", None)

        if not all([sensor_id, tipo_sensor, invernadero_id, zona, valor]):
            return jsonify({"error": "Faltan datos obligatorios"}), 400

        # Guardar en InfluxDB
        escribir_dato(sensor_id, tipo_sensor, invernadero_id, zona, valor, unidad, pos_x, pos_y)

        logging.info(f"✅ Datos recibidos y almacenados: {data}")
        return jsonify({"message": "Datos guardados correctamente"}), 201

    except Exception as e:
        logging.error(f"❌ Error al procesar datos: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
