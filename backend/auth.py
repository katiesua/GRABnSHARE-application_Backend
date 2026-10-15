"""Supabase Authentication (GoTrue) client for the GrabnShare backend.

Talks to the Supabase Auth REST API using the project URL and anon
(publishable) key from the environment. User records live in Supabase
Authentication; profile rows are created automatically in public.profiles
by the on_auth_user_created database trigger.
"""

import os
import re
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or ""

AUTH_BASE_URL = f"{SUPABASE_URL}/auth/v1"
REQUEST_TIMEOUT = 30  # seconds

# Accepted La Trobe University email formats:
#   Students: <numeric student id>@students.latrobe.edu.au
#   Staff:    <username>@latrobe.edu.au (the students subdomain is excluded)
STUDENT_EMAIL_RE = re.compile(r"^\d+@students\.latrobe\.edu\.au$", re.IGNORECASE)
STAFF_EMAIL_RE = re.compile(r"^[A-Za-z0-9._-]+@latrobe\.edu\.au$", re.IGNORECASE)

MIN_PASSWORD_LENGTH = 8


class AuthError(Exception):
    """Raised when Supabase Authentication rejects a request."""

    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


def is_latrobe_email(email: str) -> bool:
    """True when the email matches an accepted La Trobe University format."""
    if not email:
        return False
    return bool(STUDENT_EMAIL_RE.match(email) or STAFF_EMAIL_RE.match(email))


VALID_ROLES = ("student", "organiser")


def normalise_role(role) -> str:
    """Return a validated account role ('student' or 'organiser').

    Falls back to 'student' when the value is missing; raises AuthError for
    any other value. The role is chosen by the user at registration and is
    stored on public.profiles by the on_auth_user_created trigger.
    """
    if role is None or str(role).strip() == "":
        return "student"
    value = str(role).strip().lower()
    if value not in VALID_ROLES:
        raise AuthError(400, "Account role must be 'student' or 'organiser'")
    return value


def validate_signup(full_name: str, email: str, password: str, role: str = "student") -> str:
    """Validate sign-up input before contacting Supabase. Raises AuthError.

    Returns the validated account role to register with.
    """
    if not full_name or not full_name.strip():
        raise AuthError(400, "Full name is required")
    if not is_latrobe_email(email):
        raise AuthError(
            400,
            "Email must be a La Trobe University address: "
            "students use <student id>@students.latrobe.edu.au, "
            "staff use <username>@latrobe.edu.au",
        )
    if not password or len(password) < MIN_PASSWORD_LENGTH:
        raise AuthError(400, f"Password must be at least {MIN_PASSWORD_LENGTH} characters long")
    return normalise_role(role)


def _headers(token: str = None) -> dict:
    headers = {"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _error_detail(response) -> str:
    """Extract a human-readable message from a GoTrue error response."""
    try:
        payload = response.json()
    except ValueError:
        return f"Supabase authentication error (HTTP {response.status_code})"
    if isinstance(payload, dict):
        for key in ("msg", "error_description", "message", "detail", "error"):
            value = payload.get(key)
            if isinstance(value, str) and value:
                return value
    return f"Supabase authentication error (HTTP {response.status_code})"


def _raise_for_auth_error(response, default_status: int = 400) -> None:
    if response.ok:
        return
    detail = _error_detail(response)
    lowered = detail.lower()
    if "already registered" in lowered or "already been registered" in lowered:
        raise AuthError(409, "An account with this email address already exists")
    if "email not confirmed" in lowered:
        raise AuthError(403, "Email not verified. Please confirm your La Trobe email address before signing in")
    if "invalid login credentials" in lowered or "invalid_grant" in lowered:
        raise AuthError(401, "Incorrect email or password")
    if response.status_code == 429:
        raise AuthError(429, "Too many attempts. Please wait a moment and try again")
    raise AuthError(response.status_code if response.status_code >= 400 else default_status, detail)


def sign_up(email: str, password: str, full_name: str, role: str = "student") -> dict:
    """Register a new user in Supabase Authentication.

    The raw_user_meta_data (full_name + role) is consumed by the
    on_auth_user_created trigger, which creates the matching public.profiles
    row with the role selected at registration ('student' or 'organiser').
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise AuthError(500, "SUPABASE_URL and SUPABASE_ANON_KEY must be configured")
    response = requests.post(
        f"{AUTH_BASE_URL}/signup",
        headers=_headers(),
        json={
            "email": email,
            "password": password,
            "data": {"full_name": full_name.strip(), "role": normalise_role(role)},
        },
        timeout=REQUEST_TIMEOUT,
    )
    _raise_for_auth_error(response)
    payload = response.json() if response.content else {}
    user = payload.get("user") or {}
    # GoTrue may obfuscate existing users (identities == []) to prevent
    # account enumeration; both cases surface as a "verify your email" notice.
    return {"user": user, "identities": user.get("identities") or []}


def sign_in(email: str, password: str) -> dict:
    """Sign in with email + password. Returns the GoTrue session payload."""
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise AuthError(500, "SUPABASE_URL and SUPABASE_ANON_KEY must be configured")
    response = requests.post(
        f"{AUTH_BASE_URL}/token",
        params={"grant_type": "password"},
        headers=_headers(),
        json={"email": email, "password": password},
        timeout=REQUEST_TIMEOUT,
    )
    _raise_for_auth_error(response)
    return response.json()


def get_user(access_token: str) -> dict:
    """Verify an access token and return the Supabase Auth user record."""
    response = requests.get(
        f"{AUTH_BASE_URL}/user",
        headers=_headers(access_token),
        timeout=REQUEST_TIMEOUT,
    )
    if response.status_code in (401, 403):
        raise AuthError(401, "Invalid or expired session token")
    _raise_for_auth_error(response)
    return response.json()


def refresh_session(refresh_token: str) -> dict:
    """Exchange a refresh token for a new session."""
    response = requests.post(
        f"{AUTH_BASE_URL}/token",
        params={"grant_type": "refresh_token"},
        headers=_headers(),
        json={"refresh_token": refresh_token},
        timeout=REQUEST_TIMEOUT,
    )
    if response.status_code in (400, 401, 403):
        raise AuthError(401, "Session expired. Please sign in again")
    _raise_for_auth_error(response)
    return response.json()


def sign_out(access_token: str) -> None:
    """Revoke a session. Never raises - signing out is best effort."""
    try:
        requests.post(
            f"{AUTH_BASE_URL}/logout",
            headers=_headers(access_token),
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException:
        pass