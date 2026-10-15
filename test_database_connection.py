import os
import sys
from urllib.parse import urlparse
from dotenv import load_dotenv
import psycopg2

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in environment variables.")
    sys.exit(1)

try:
    parsed = urlparse(DATABASE_URL)
    print(f"Connecting to: {parsed.hostname}:{parsed.port}/{parsed.path.lstrip('/')}")

    conn = psycopg2.connect(DATABASE_URL)
    with conn.cursor() as cur:
        cur.execute("SELECT 1")
    conn.close()
    print("Database connection successful")
except Exception as e:
    print(f"Database connection failed: {e}")
    sys.exit(1)
