import os
import requests
from flask import request, jsonify, g
from functools import wraps

SUPABASE_PROJECT_URL = os.getenv("SUPABASE_URL")
SUPABASE_AUTH_URL = f"{SUPABASE_PROJECT_URL}/auth/v1/user"
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

def supabase_auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token no proporcionado o inválido"}), 401

        token = auth_header.split(" ")[1]
        print(f"[DEBUG] Token recibido: {token}")
        print(f"[DEBUG] URL de verificación: {SUPABASE_AUTH_URL}")

        # Llamar a Supabase para validar el token
        try:
            response = requests.get(
                SUPABASE_AUTH_URL,
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": SUPABASE_ANON_KEY
                }
            )

            print(f"[DEBUG] Código de respuesta Supabase: {response.status_code}")
            print(f"[DEBUG] Respuesta Supabase: {response.text}")

            if response.status_code != 200:
                return jsonify({"error": "Token inválido o expirado"}), 401

            user_data = response.json()
            g.current_user = user_data  # Guardamos en el contexto global de Flask

        except Exception as e:
            return jsonify({"error": f"Error al verificar token: {str(e)}"}), 500

        return f(*args, **kwargs)

    return decorated_function