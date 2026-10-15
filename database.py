import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    """Create and return a new database connection."""
    return psycopg2.connect(DATABASE_URL)


def init_db():
    """Initialize the database by running the SQL setup script."""
    sql_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "setup_database.sql")
    with open(sql_path, "r") as f:
        sql = f.read()

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
        print("Database initialization completed successfully")
    except Exception as e:
        conn.rollback()
        print(f"Database initialization failed: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    init_db()
