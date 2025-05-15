# src/app/routers/zonas_sensores.py

from flask import Blueprint, jsonify
#from app.queries.sensor_queries import obtener_sensores_por_zona
from app.queries.sensor_parametro_queries import obtener_sensores_con_tipos_por_zona

router = Blueprint('sensores_por_zona', __name__)

#@router.route('/<int:zona_id>/sensores', methods=['GET'])
#def listar_sensores_zona(zona_id):
    #"""GET /api/zonas/{zona_id}/sensores → devuelve sensores de una zona."""
    #try:
        #sensores = obtener_sensores_por_zona(zona_id)
        #return jsonify(sensores), 200
    #except Exception as e:
        #return jsonify({"error": str(e)}), 500
@router.route('/<int:zona_id>/sensores', methods=['GET'])
def listar_sensores_zona(zona_id):
    """
    GET /api/zonas/{zona_id}/sensores →
    devuelve [{ id, nombre, tipos: [...] }, …]
    """
    try:
        data = obtener_sensores_con_tipos_por_zona(zona_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
