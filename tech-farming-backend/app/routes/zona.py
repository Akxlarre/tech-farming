# src/app/routers/zonas.py

from flask import Blueprint, jsonify
from app.queries.zona_queries import obtener_zonas_por_invernadero

# Definimos el blueprint sin prefix
router = Blueprint('zonas', __name__)
#SE LISTAN ZONAS SOLO POR 1 INVERNADERO
@router.route('/<int:invernadero_id>/zonas', methods=['GET'])
def listar_zonas(invernadero_id):
    """GET /api/invernaderos/{invernadero_id}/zonas"""
    try:
        zonas = obtener_zonas_por_invernadero(invernadero_id)
        return jsonify(zonas), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
