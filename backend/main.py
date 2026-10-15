import os
from contextlib import asynccontextmanager
from datetime import datetime, date, time as dt_time
from fastapi import FastAPI, HTTPException, Query, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from database import init_db, get_connection
import auth

load_dotenv()

# Supabase Authentication is mandatory for every /api route except
# /api/auth/signup, /api/auth/login and /api/auth/refresh.
# AUTH_REQUIRED=false is only a temporary rollback switch for deployments where
# a cached frontend bundle has not yet been updated to send tokens. It never
# attributes data to anonymous or demo users: mutations always require a real
# authenticated user.
AUTH_REQUIRED = os.getenv("AUTH_REQUIRED", "true").strip().lower() not in ("0", "false", "no", "off")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="GrabnShare API",
    description="Campus food-sharing backend for La Trobe University",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic request models

class FoodPostCreate(BaseModel):
    organiserName: str
    organiserRole: Optional[str] = None
    campusOrganisation: Optional[str] = None
    foodAvailable: Optional[str] = None
    foodDescription: Optional[str] = None
    dietaryInformation: Optional[str] = None
    eventName: Optional[str] = None
    collectionLocation: str
    pickupPoint: Optional[str] = None
    collectionCloses: Optional[str] = None
    collectionStarts: Optional[str] = None
    scheduledDate: Optional[str] = None
    estimatedServes: Optional[int] = None
    collectionNotes: Optional[str] = None
    postType: str = "immediate"


class FoodPostUpdate(BaseModel):
    foodAvailable: Optional[str] = None
    foodDescription: Optional[str] = None
    dietaryInformation: Optional[str] = None
    eventName: Optional[str] = None
    collectionLocation: Optional[str] = None
    pickupPoint: Optional[str] = None
    collectionCloses: Optional[str] = None
    collectionStarts: Optional[str] = None
    scheduledDate: Optional[str] = None
    estimatedServes: Optional[int] = None
    collectionNotes: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str


class SignUpRequest(BaseModel):
    fullName: str
    email: str
    password: str
    role: Optional[str] = "student"


class SignInRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    refreshToken: str


# Helpers

STATUS_DB_TO_FE = {
    "available": "Available",
    "scheduled": "Scheduled",
    "completed": "All Gone",
}

STATUS_FE_TO_DB = {v: k for k, v in STATUS_DB_TO_FE.items()}


def _combine_date_time(date_str: str, time_str: str) -> datetime:
    d = date.fromisoformat(date_str)
    parts = time_str.split(":")
    t = dt_time(int(parts[0]), int(parts[1]))
    return datetime.combine(d, t)


def _row_to_post(row, columns) -> dict:
    d = dict(zip(columns, row))
    collection_closes = None
    collection_starts = None
    scheduled_date = None

    if d.get("available_until") and isinstance(d["available_until"], datetime):
        collection_closes = d["available_until"].strftime("%H:%M")
    if d.get("available_from") and isinstance(d["available_from"], datetime):
        collection_starts = d["available_from"].strftime("%H:%M")
    if d.get("scheduled_for") and isinstance(d["scheduled_for"], datetime):
        scheduled_date = d["scheduled_for"].strftime("%Y-%m-%d")

    created = d.get("created_at")
    created_iso = (
        created.isoformat() if isinstance(created, datetime)
        else (str(created) if created else None)
    )

    return {
        "id": str(d["id"]),
        "organiserId": str(d["organiser_id"]) if d.get("organiser_id") else None,
        "organiserName": d.get("organiser_name") or "",
        "organiserRole": d.get("employment_status") or "",
        "campusOrganisation": d.get("department") or "",
        "foodAvailable": d.get("food_name") or "",
        "foodDescription": d.get("description") or "",
        "dietaryInformation": d.get("dietary_information") or "",
        "eventName": d.get("event_name") or "",
        "collectionLocation": d.get("collection_location") or "",
        "pickupPoint": d.get("pickup_point") or "",
        "collectionCloses": collection_closes,
        "collectionStarts": collection_starts,
        "scheduledDate": scheduled_date,
        "estimatedServes": d.get("quantity") or "",
        "collectionNotes": d.get("collection_instructions") or "",
        "status": STATUS_DB_TO_FE.get(d.get("status", ""), d.get("status", "")),
        "type": d.get("post_type", "immediate"),
        "createdAt": created_iso,
        "availableFrom": d["available_from"].isoformat() if d.get("available_from") else None,
        "availableUntil": d["available_until"].isoformat() if d.get("available_until") else None,
        "scheduledFor": d["scheduled_for"].isoformat() if d.get("scheduled_for") else None,
    }


def _fetch_post_row(cur, post_id: str):
    cur.execute("SELECT * FROM food_posts WHERE id = %s", (post_id,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Food post not found")
    columns = [desc[0] for desc in cur.description]
    return row, columns


# Supabase authentication dependencies

def _extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    token = parts[1].strip()
    return token or None


def _get_or_create_profile(cur, supa_user: dict) -> dict:
    """Load the public.profiles row for a Supabase Auth user.

    The on_auth_user_created trigger creates the row at registration with the
    role selected at sign-up; the insert below is only a defensive fallback
    and mirrors the trigger (validated role from the registration metadata,
    defaulting to 'student').
    """
    user_id = supa_user.get("id")
    cur.execute("SELECT id, full_name, email, role FROM profiles WHERE id = %s", (user_id,))
    row = cur.fetchone()
    if not row:
        metadata = supa_user.get("user_metadata") or {}
        full_name = (metadata.get("full_name") or metadata.get("name") or "").strip()
        try:
            role = auth.normalise_role(metadata.get("role"))
        except auth.AuthError:
            role = "student"
        cur.execute(
            "INSERT INTO profiles (id, full_name, email, role) VALUES (%s, %s, %s, %s) "
            "ON CONFLICT (id) DO NOTHING",
            (user_id, full_name, supa_user.get("email") or "", role),
        )
        cur.execute("SELECT id, full_name, email, role FROM profiles WHERE id = %s", (user_id,))
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=403, detail="No profile exists for this user")
    return {"id": str(row[0]), "fullName": row[1] or "", "email": row[2], "role": row[3]}


def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Verify the Supabase bearer token and return the authenticated profile.

    Returns None only when AUTH_REQUIRED is disabled and no token is sent.
    """
    token = _extract_bearer_token(authorization)
    if token is None:
        if AUTH_REQUIRED:
            raise HTTPException(
                status_code=401,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return None
    try:
        supa_user = auth.get_user(token)
    except auth.AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    if not supa_user.get("email_confirmed_at"):
        raise HTTPException(
            status_code=403,
            detail="Email not verified. Please confirm your La Trobe email address before continuing",
        )
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            profile = _get_or_create_profile(cur, supa_user)
        conn.commit()
        return profile
    finally:
        conn.close()


def require_user(user: Optional[dict] = Depends(get_current_user)) -> dict:
    """Require a real authenticated user (used for all mutations)."""
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_organiser(user: dict = Depends(require_user)) -> dict:
    """Require the organiser role (selected by the user at registration)."""
    if user.get("role") != "organiser":
        raise HTTPException(
            status_code=403,
            detail="Organiser privileges are required for this action",
        )
    return user


def _assert_post_owner(row, columns, user: dict) -> None:
    organiser_id = dict(zip(columns, row)).get("organiser_id")
    if str(organiser_id) != str(user["id"]):
        raise HTTPException(status_code=403, detail="You can only modify your own food posts")


# Root & health-check

@app.get("/")
async def root():
    return {
        "message": "Welcome to the GrabnShare API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}


# Authentication (Supabase) - sign up / sign in / session

@app.post("/api/auth/signup", status_code=201)
async def signup(body: SignUpRequest):
    """Register a new La Trobe account with Supabase Authentication.

    The on_auth_user_created trigger automatically creates the matching
    public.profiles row with the account role selected at sign-up
    ('student' or 'organiser').
    """
    try:
        role = auth.validate_signup(body.fullName, body.email, body.password, body.role)
        auth.sign_up(body.email, body.password, body.fullName, role)
    except auth.AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    return {
        "success": True,
        "message": (
            "Registration received. A verification link has been sent to your "
            "La Trobe email address. Please verify your email before signing in."
        ),
        "email": body.email,
        "emailVerificationRequired": True,
    }


def _session_response(session: dict) -> dict:
    """Build the login/refresh response with tokens and the user's profile."""
    supa_user = session.get("user") or {}
    if not supa_user.get("email_confirmed_at"):
        raise HTTPException(
            status_code=403,
            detail="Email not verified. Please confirm your La Trobe email address before signing in",
        )
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            profile = _get_or_create_profile(cur, supa_user)
        conn.commit()
    finally:
        conn.close()
    return {
        "success": True,
        "accessToken": session.get("access_token"),
        "refreshToken": session.get("refresh_token"),
        "expiresAt": session.get("expires_at"),
        "expiresIn": session.get("expires_in"),
        "user": profile,
    }


@app.post("/api/auth/login")
async def login(body: SignInRequest):
    try:
        session = auth.sign_in(body.email, body.password)
    except auth.AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    return _session_response(session)


@app.post("/api/auth/refresh")
async def refresh_session(body: RefreshRequest):
    try:
        session = auth.refresh_session(body.refreshToken)
    except auth.AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    return _session_response(session)


@app.post("/api/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    token = _extract_bearer_token(authorization)
    if token:
        auth.sign_out(token)  # best effort - never fails the logout
    return {"success": True}


@app.get("/api/auth/me")
async def me(user: dict = Depends(require_user)):
    return {"success": True, "user": user}


# Food Posts - List & Get

@app.get("/api/food-posts")
async def list_food_posts(
    status: Optional[str] = Query(None, description="Filter by frontend status"),
    mine: bool = Query(False, description="Only return posts created by the authenticated organiser"),
    user: Optional[dict] = Depends(get_current_user),
):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            conditions = []
            params = []
            if status:
                conditions.append("status = %s")
                params.append(STATUS_FE_TO_DB.get(status, status.lower()))
            if mine:
                if user is None:
                    raise HTTPException(status_code=401, detail="Not authenticated")
                conditions.append("organiser_id = %s")
                params.append(user["id"])
            where_clause = f" WHERE {' AND '.join(conditions)}" if conditions else ""
            cur.execute(
                f"SELECT * FROM food_posts{where_clause} ORDER BY created_at DESC",
                params,
            )
            columns = [desc[0] for desc in cur.description]
            rows = cur.fetchall()
            return [_row_to_post(r, columns) for r in rows]
    finally:
        conn.close()


@app.get("/api/food-posts/{post_id}")
async def get_food_post(post_id: str, user: Optional[dict] = Depends(get_current_user)):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row, columns = _fetch_post_row(cur, post_id)
            return _row_to_post(row, columns)
    finally:
        conn.close()


# Food Posts - Create

@app.post("/api/food-posts", status_code=201)
async def create_food_post(body: FoodPostCreate, user: dict = Depends(require_organiser)):
    post_type = body.postType
    db_status = "scheduled" if post_type == "scheduled" else "available"
    now = datetime.now()

    if post_type == "scheduled" and body.scheduledDate:
        sched_date = body.scheduledDate
        available_from = (
            _combine_date_time(sched_date, body.collectionStarts)
            if body.collectionStarts
            else _combine_date_time(sched_date, "00:00")
        )
        available_until = (
            _combine_date_time(sched_date, body.collectionCloses)
            if body.collectionCloses
            else _combine_date_time(sched_date, "23:59")
        )
        scheduled_for = _combine_date_time(sched_date, "00:00")
    else:
        available_from = now
        if body.collectionCloses:
            available_until = _combine_date_time(now.strftime("%Y-%m-%d"), body.collectionCloses)
        else:
            available_until = now.replace(hour=23, minute=59, second=59, microsecond=0)
        scheduled_for = None

    food_name = body.foodAvailable or body.eventName or "Food Available"

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO food_posts (
                    organiser_id, organiser_name, department, employment_status,
                    post_type, food_name, description, quantity, event_name,
                    collection_location, pickup_point, collection_instructions,
                    dietary_information,
                    available_from, available_until, scheduled_for, status
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                RETURNING *
                """,
                (
                    user["id"], body.organiserName,
                    body.campusOrganisation, body.organiserRole,
                    post_type, food_name, body.foodDescription,
                    str(body.estimatedServes) if body.estimatedServes is not None else None,
                    body.eventName, body.collectionLocation, body.pickupPoint,
                    body.collectionNotes, body.dietaryInformation,
                    available_from, available_until, scheduled_for, db_status,
                ),
            )
            row = cur.fetchone()
            columns = [desc[0] for desc in cur.description]
            conn.commit()
            return _row_to_post(row, columns)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# Status update & Delete

@app.patch("/api/food-posts/{post_id}/status")
async def update_post_status(post_id: str, body: StatusUpdate, user: dict = Depends(require_organiser)):
    db_status = STATUS_FE_TO_DB.get(body.status, body.status.lower())
    if db_status not in ("available", "scheduled", "completed"):
        raise HTTPException(status_code=400, detail=f"Invalid status: {body.status}")
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row, columns = _fetch_post_row(cur, post_id)
            _assert_post_owner(row, columns, user)
            cur.execute(
                "UPDATE food_posts SET status = %s, updated_at = %s WHERE id = %s RETURNING *",
                (db_status, datetime.now(), post_id),
            )
            row = cur.fetchone()
            columns = [desc[0] for desc in cur.description]
            conn.commit()
            return _row_to_post(row, columns)
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.delete("/api/food-posts/{post_id}", status_code=204)
async def delete_food_post(post_id: str, user: dict = Depends(require_organiser)):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row, columns = _fetch_post_row(cur, post_id)
            _assert_post_owner(row, columns, user)
            cur.execute("DELETE FROM food_posts WHERE id = %s RETURNING id", (post_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Food post not found")
            conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.put("/api/food-posts/{post_id}")
async def update_food_post(post_id: str, body: FoodPostUpdate, user: dict = Depends(require_organiser)):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row, columns = _fetch_post_row(cur, post_id)
            _assert_post_owner(row, columns, user)
            updates = {}
            if body.foodAvailable is not None:
                updates["food_name"] = body.foodAvailable
            if body.foodDescription is not None:
                updates["description"] = body.foodDescription
            if body.dietaryInformation is not None:
                updates["dietary_information"] = body.dietaryInformation
            if body.eventName is not None:
                updates["event_name"] = body.eventName
            if body.collectionLocation is not None:
                updates["collection_location"] = body.collectionLocation
            if body.pickupPoint is not None:
                updates["pickup_point"] = body.pickupPoint
            if body.collectionNotes is not None:
                updates["collection_instructions"] = body.collectionNotes
            if body.estimatedServes is not None:
                updates["quantity"] = str(body.estimatedServes)
            if body.collectionCloses is not None:
                cur.execute("SELECT available_until FROM food_posts WHERE id = %s", (post_id,))
                r = cur.fetchone()
                if r and r[0]:
                    updates["available_until"] = _combine_date_time(r[0].strftime("%Y-%m-%d"), body.collectionCloses)
            if body.collectionStarts is not None:
                cur.execute("SELECT available_from FROM food_posts WHERE id = %s", (post_id,))
                r = cur.fetchone()
                if r and r[0]:
                    updates["available_from"] = _combine_date_time(r[0].strftime("%Y-%m-%d"), body.collectionStarts)
            if not updates:
                raise HTTPException(status_code=400, detail="No fields to update")
            updates["updated_at"] = datetime.now()
            set_clause = ", ".join(f"{k} = %s" for k in updates)
            values = list(updates.values()) + [post_id]
            cur.execute(f"UPDATE food_posts SET {set_clause} WHERE id = %s RETURNING *", values)
            row = cur.fetchone()
            columns = [desc[0] for desc in cur.description]
            conn.commit()
            return _row_to_post(row, columns)
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
# Claims ("I'm Going")

@app.post("/api/food-posts/{post_id}/claims", status_code=201)
async def create_claim(post_id: str, user: dict = Depends(require_user)):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            _fetch_post_row(cur, post_id)
            cur.execute(
                "INSERT INTO food_claims (food_post_id, student_id) "
                "VALUES (%s, %s) ON CONFLICT (food_post_id, student_id) DO NOTHING RETURNING id",
                (post_id, user["id"]),
            )
            row = cur.fetchone()
            conn.commit()
            return {"success": True, "id": str(row[0]) if row else None}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.delete("/api/food-posts/{post_id}/claims", status_code=204)
async def remove_claim(post_id: str, user: dict = Depends(require_user)):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM food_claims WHERE food_post_id = %s AND student_id = %s",
                (post_id, user["id"]),
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# Reminders

@app.post("/api/food-posts/{post_id}/reminders", status_code=201)
async def create_reminder(post_id: str, user: dict = Depends(require_user)):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            _fetch_post_row(cur, post_id)
            cur.execute(
                "INSERT INTO food_reminders (food_post_id, student_id) "
                "VALUES (%s, %s) ON CONFLICT (food_post_id, student_id) DO NOTHING RETURNING id",
                (post_id, user["id"]),
            )
            row = cur.fetchone()
            conn.commit()
            return {"success": True, "id": str(row[0]) if row else None}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.delete("/api/food-posts/{post_id}/reminders", status_code=204)
async def remove_reminder(post_id: str, user: dict = Depends(require_user)):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM food_reminders WHERE food_post_id = %s AND student_id = %s",
                (post_id, user["id"]),
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# Dashboard Stats

@app.get("/api/stats")
async def get_stats(user: Optional[dict] = Depends(get_current_user)):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT COUNT(*) FROM food_posts WHERE status IN ('available', 'scheduled')"
            )
            active_events = cur.fetchone()[0]
            cur.execute(
                "SELECT COALESCE(SUM(CAST(quantity AS INTEGER)), 0) "
                "FROM food_posts WHERE quantity ~ '^[0-9]+$'"
            )
            food_items_shared = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM food_claims")
            students_reached = cur.fetchone()[0]
            return {
                "activeEvents": active_events,
                "foodItemsShared": food_items_shared,
                "studentsReached": students_reached,
            }
    finally:
        conn.close()


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("APP_HOST", "127.0.0.1")
    port = int(os.getenv("APP_PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)