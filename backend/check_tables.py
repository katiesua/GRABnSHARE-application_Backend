import os
import sys
from dotenv import load_dotenv
import psycopg2

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in environment variables.")
    sys.exit(1)

TABLES = ["profiles", "food_posts", "food_claims", "food_reminders"]

try:
    conn = psycopg2.connect(DATABASE_URL)
    with conn.cursor() as cur:
        # Check tables
        for table in TABLES:
            cur.execute(
                """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = %s
                )
                """,
                (table,),
            )
            exists = cur.fetchone()[0]
            if exists:
                print(f"Table found: public.{table}")
            else:
                print(f"Table NOT found: public.{table}")

        # Check triggers
        triggers = [
            ("on_auth_user_created", "auth", "users"),
            ("on_auth_user_updated", "auth", "users"),
            ("enforce_role_authorisation", "public", "profiles"),
            ("set_profiles_updated_at", "public", "profiles"),
            ("set_food_posts_updated_at", "public", "food_posts"),
        ]
        for trigger_name, schema, table in triggers:
            cur.execute(
                """
                SELECT EXISTS (
                    SELECT FROM information_schema.triggers
                    WHERE trigger_name = %s
                    AND event_object_schema = %s
                    AND event_object_table = %s
                )
                """,
                (trigger_name, schema, table),
            )
            if cur.fetchone()[0]:
                print(f"Trigger found: {trigger_name} on {schema}.{table}")
            else:
                print(f"Trigger NOT found: {trigger_name} on {schema}.{table}")

        # Check auth helper functions
        functions = [
            "is_latrobe_email",
            "handle_new_user",
            "handle_user_update",
            "prevent_self_role_escalation",
            "set_updated_at",
        ]
        for function_name in functions:
            cur.execute(
                """
                SELECT EXISTS (
                    SELECT FROM information_schema.routines
                    WHERE routine_schema = 'public'
                    AND routine_name = %s
                )
                """,
                (function_name,),
            )
            if cur.fetchone()[0]:
                print(f"Function found: public.{function_name}")
            else:
                print(f"Function NOT found: public.{function_name}")

    conn.close()
except Exception as e:
    print(f"Check failed: {e}")
    sys.exit(1)
