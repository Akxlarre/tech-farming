import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = psycopg2.connect(os.getenv("POSTGRES_URL"))
    print("✅ ¡Conexión exitosa a Supabase PostgreSQL!")
except Exception as e:
    print("❌ Error de conexión:")
    print(e)