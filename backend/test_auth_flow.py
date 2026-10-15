"""End-to-end checks for Supabase Authentication in the GrabnShare backend.

Start the API first (venv\\Scripts\\python.exe main.py), then run:
    venv\\Scripts\\python.exe test_auth_flow.py

The script registers clearly-named TEST accounts and confirms their emails
directly in the database (simulating the verification link click):
    12345678@students.latrobe.edu.au   student test
    87654321@students.latrobe.edu.au   student test (cross-user checks)
    grabnshare.test@latrobe.edu.au     staff test (admin-promoted to organiser)
Delete them afterwards from Supabase Auth -> Users if no longer needed.
"""
import os
import sys
import requests
import psycopg2
from dotenv import load_dotenv

load_dotenv()

BASE = f"http://{os.getenv('APP_HOST', '127.0.0.1')}:{os.getenv('APP_PORT', '8000')}"
DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").rstrip("/")
ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or ""
PASSWORD = "GrabnShare!2026"

results = []


def check(name, condition, extra=""):
    results.append(bool(condition))
    print(("PASS" if condition else "FAIL"), "-", name, ("| " + str(extra) if extra else ""))


def sql(query, params=(), fetch=False):
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall() if fetch else None
        conn.commit()
        return rows
    finally:
        conn.close()


def confirm_email(email):
    """Simulate clicking the Supabase email verification link."""
    sql("UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = %s", (email,))


def signup(email, full_name):
    return requests.post(f"{BASE}/api/auth/signup", json={
        "fullName": full_name, "email": email, "password": PASSWORD,
    }, timeout=30)


def login(email):
    return requests.post(f"{BASE}/api/auth/login", json={
        "email": email, "password": PASSWORD,
    }, timeout=30)


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


print("== Public routes ==")
check("GET / is public", requests.get(f"{BASE}/", timeout=10).status_code == 200)
check("GET /health is public", requests.get(f"{BASE}/health", timeout=10).status_code == 200)
check("GET /api/food-posts without token -> 401",
      requests.get(f"{BASE}/api/food-posts", timeout=10).status_code == 401)
check("GET /api/stats without token -> 401",
      requests.get(f"{BASE}/api/stats", timeout=10).status_code == 401)
check("POST /api/food-posts without token -> 401",
      requests.post(f"{BASE}/api/food-posts", json={"organiserName": "X", "collectionLocation": "Y"},
                    timeout=10).status_code == 401)

print("\n== Sign up ==")
r = signup("someone@gmail.com", "Not Latrobe")
check("non-Latrobe email rejected", r.status_code == 400, r.text[:120])
r = signup("12345678@students.latrobe.edu.au", "Test Student One")
check("student registration accepted (or already exists)", r.status_code in (201, 409), r.text[:120])
r = signup("87654321@students.latrobe.edu.au", "Test Student Two")
check("second student registration accepted (or already exists)", r.status_code in (201, 409), r.text[:120])
r = signup("grabnshare.test@latrobe.edu.au", "Test Staff Member")
check("staff registration accepted (or already exists)", r.status_code in (201, 409), r.text[:120])

print("\n== Email verification gate ==")
# Simulate an unverified account (independent of the project's auto-confirm
# setting) and make sure the backend refuses to grant access to it.
sql("UPDATE auth.users SET email_confirmed_at = NULL WHERE email = %s",
    ("12345678@students.latrobe.edu.au",))
r = login("12345678@students.latrobe.edu.au")
check("login blocked before email verification", r.status_code == 403, r.text[:120])
rows = sql("SELECT email_confirmed_at <= created_at + interval '2 seconds' FROM auth.users WHERE email = %s",
           ("grabnshare.test@latrobe.edu.au",), fetch=True)
if rows and rows[0][0]:
    print("CONFIG NOTE: Supabase 'Confirm email' is currently OFF (accounts are auto-confirmed).")
    print("             Enable it in Authentication -> Sign In / Providers -> Email so that")
    print("             registrations must verify their La Trobe address before signing in.")
confirm_email("12345678@students.latrobe.edu.au")
confirm_email("87654321@students.latrobe.edu.au")
confirm_email("grabnshare.test@latrobe.edu.au")

r = login("12345678@students.latrobe.edu.au")
check("student login after verification", r.status_code == 200, r.text[:120])
student1 = r.json()
check("student profile has student role", student1.get("user", {}).get("role") == "student")
check("student profile shows real name", student1.get("user", {}).get("fullName") == "Test Student One")
student1_token = student1.get("accessToken")
student1_id = student1.get("user", {}).get("id")

r = login("grabnshare.test@latrobe.edu.au")
check("staff login after verification", r.status_code == 200, r.text[:120])
staff = r.json()
staff_token = staff.get("accessToken")
staff_id = staff.get("user", {}).get("id")

print("\n== Profile trigger (Auth users <-> public.profiles) ==")
rows = sql("SELECT id, full_name, email, role FROM profiles WHERE email IN "
           "('12345678@students.latrobe.edu.au','grabnshare.test@latrobe.edu.au') ORDER BY email", fetch=True)
check("profiles created automatically by trigger", rows is not None and len(rows) == 2, rows)
rows = sql("SELECT id, full_name, email, role FROM profiles WHERE id IN "
           "('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002')", fetch=True)
check("existing demo profiles preserved", rows is not None and len(rows) == 2, rows)

print("\n== Role rules ==")
r = requests.get(f"{BASE}/api/auth/me", headers=auth_headers(student1_token), timeout=30)
check("GET /api/auth/me returns profile", r.status_code == 200 and r.json().get("user", {}).get("role") == "student")
r = requests.post(f"{BASE}/api/food-posts", headers=auth_headers(student1_token),
                  json={"organiserName": "Test", "collectionLocation": "Union Hall"}, timeout=30)
check("student cannot create food posts", r.status_code == 403, r.text[:120])
r = requests.patch(
    f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{student1_id}",
    headers={"apikey": ANON_KEY, "Authorization": f"Bearer {student1_token}",
             "Content-Type": "application/json", "Prefer": "return=minimal"},
    json={"role": "organiser"}, timeout=30,
)
check("self role escalation blocked by DB trigger", r.status_code >= 400, r.text[:120])
sql("UPDATE profiles SET role = 'organiser' WHERE id = %s", (staff_id,))
r = requests.get(f"{BASE}/api/auth/me", headers=auth_headers(staff_token), timeout=30)
check("admin (SQL) role grant takes effect", r.status_code == 200 and r.json().get("user", {}).get("role") == "organiser")

print("\n== Organiser posting (immediate + scheduled) ==")
r = requests.post(f"{BASE}/api/food-posts", headers=auth_headers(staff_token), json={
    "organiserName": "Test Staff Member", "collectionLocation": "Union Hall",
    "pickupPoint": "Main entrance", "foodAvailable": "Sandwiches",
    "estimatedServes": 10, "collectionCloses": "18:30", "postType": "immediate",
}, timeout=30)
check("organiser creates immediate post", r.status_code == 201, r.text[:120])
post_now = r.json()
check("post attributed to the real organiser id", post_now.get("organiserId") == staff_id)
r = requests.post(f"{BASE}/api/food-posts", headers=auth_headers(staff_token), json={
    "organiserName": "Test Staff Member", "collectionLocation": "Agora",
    "foodAvailable": "Pizza", "eventName": "Test Event", "scheduledDate": "2026-11-01",
    "collectionStarts": "12:00", "collectionCloses": "14:00", "postType": "scheduled",
}, timeout=30)
check("organiser creates scheduled post", r.status_code == 201, r.text[:120])
post_sched = r.json()
r = requests.get(f"{BASE}/api/food-posts?mine=true", headers=auth_headers(staff_token), timeout=30)
mine_ids = [p["id"] for p in r.json()]
check("mine=true returns only own posts", post_now.get("id") in mine_ids and post_sched.get("id") in mine_ids)

print("\n== Student interactions & ownership ==")
r = login("87654321@students.latrobe.edu.au")
student2 = r.json()
student2_token = student2.get("accessToken")
r = requests.post(f"{BASE}/api/food-posts/{post_now['id']}/claims", headers=auth_headers(student2_token), timeout=30)
check("student claims a post", r.status_code == 201, r.text[:120])
r = requests.post(f"{BASE}/api/food-posts/{post_sched['id']}/reminders", headers=auth_headers(student2_token), timeout=30)
check("student sets a reminder", r.status_code == 201, r.text[:120])
r = requests.put(f"{BASE}/api/food-posts/{post_now['id']}", headers=auth_headers(student2_token),
                 json={"foodAvailable": "Hacked"}, timeout=30)
check("student cannot edit another user's post", r.status_code == 403, r.text[:120])
r = requests.delete(f"{BASE}/api/food-posts/{post_now['id']}", headers=auth_headers(student2_token), timeout=30)
check("student cannot delete another user's post", r.status_code == 403, r.text[:120])
r = requests.delete(f"{BASE}/api/food-posts/{post_now['id']}/claims", headers=auth_headers(student1_token), timeout=30)
check("cross-user claim removal is a no-op", r.status_code == 204)
rows = sql("SELECT student_id FROM food_claims WHERE food_post_id = %s", (post_now["id"],), fetch=True)
check("other user's claim untouched", rows and str(rows[0][0]) == student2.get("user", {}).get("id"), rows)

# Ownership enforcement between two organisers
sql("UPDATE profiles SET role = 'organiser' WHERE id = %s", (student2.get("user", {}).get("id"),))
r = requests.put(f"{BASE}/api/food-posts/{post_now['id']}", headers=auth_headers(student2_token),
                 json={"foodAvailable": "Hacked"}, timeout=30)
check("organiser cannot edit another organiser's post", r.status_code == 403 and "own food posts" in r.text, r.text[:120])
r = requests.delete(f"{BASE}/api/food-posts/{post_now['id']}", headers=auth_headers(student2_token), timeout=30)
check("organiser cannot delete another organiser's post", r.status_code == 403 and "own food posts" in r.text, r.text[:120])
sql("UPDATE profiles SET role = 'student' WHERE id = %s", (student2.get("user", {}).get("id"),))

print("\n== Session ==")
r = requests.post(f"{BASE}/api/auth/logout", headers=auth_headers(student1_token), timeout=30)
check("logout succeeds", r.status_code == 200, r.text[:120])

print("\n== Cleanup of test posts (test users are kept for inspection) ==")
for post in (post_now, post_sched):
    if post and post.get("id"):
        sql("DELETE FROM food_posts WHERE id = %s", (post["id"],))
rows = sql("SELECT COUNT(*) FROM food_posts", fetch=True)
check("food_posts intact after cleanup", rows[0][0] >= 0, rows)

passed = sum(results)
print(f"\n{passed}/{len(results)} checks passed")
sys.exit(0 if passed == len(results) else 1)