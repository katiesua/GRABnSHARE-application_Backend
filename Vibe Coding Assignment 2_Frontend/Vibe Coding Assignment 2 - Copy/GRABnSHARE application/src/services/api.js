/**
 * API service layer — all HTTP calls to the GrabnShare backend.
 * Uses Vite proxy in dev (relative /api paths) or VITE_API_URL in prod.
 *
 * Supabase Authentication: the session (tokens + user profile) is kept in
 * localStorage and sent as an Authorization: Bearer header with every request.
 * A 401 response clears the session and returns the user to the login screen.
 */

const API_URL = import.meta.env.VITE_API_URL || ''

const SESSION_KEY = 'grabnshare.session'

/* ── Session storage ─────────────────────────────── */

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function getAccessToken() {
  return getSession()?.accessToken || null
}

/* ── HTTP core ───────────────────────────────────── */

async function request(path, options = {}) {
  const url = `${API_URL}${path}`
  const token = getAccessToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(url, { ...options, headers })

  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    clearSession()
    if (window.location.pathname !== '/') window.location.assign('/')
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let detail = text
    try {
      const body = JSON.parse(text)
      if (body && body.detail) detail = body.detail
    } catch {
      /* keep the raw text */
    }
    throw new Error(detail ? `API ${res.status}: ${detail}` : `API ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

/* ── Authentication ──────────────────────────────── */

export function signUp({ fullName, email, password, role = 'student' }) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password, role }),
  })
}

export async function signIn(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  saveSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
    user: data.user,
  })
  return data
}

export async function signOut() {
  try {
    await request('/api/auth/logout', { method: 'POST' })
  } finally {
    clearSession()
  }
}

export function fetchMe() {
  return request('/api/auth/me')
}

/* ── Food Posts ─────────────────────────────────── */

export function fetchFoodPosts(status, { mine = false } = {}) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (mine) params.set('mine', 'true')
  const qs = params.toString()
  return request(`/api/food-posts${qs ? `?${qs}` : ''}`)
}

export function fetchFoodPost(id) {
  return request(`/api/food-posts/${id}`)
}

export function createFoodPost(data) {
  return request('/api/food-posts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateFoodPost(id, data) {
  return request(`/api/food-posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function updatePostStatus(id, status) {
  return request(`/api/food-posts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function deleteFoodPost(id) {
  return request(`/api/food-posts/${id}`, { method: 'DELETE' })
}

/* ── Claims ("I'm Going") ──────────────────────── */

export function claimFoodPost(id) {
  return request(`/api/food-posts/${id}/claims`, { method: 'POST' })
}

export function removeClaim(id) {
  return request(`/api/food-posts/${id}/claims`, { method: 'DELETE' })
}

/* ── Reminders ─────────────────────────────────── */

export function setReminder(id) {
  return request(`/api/food-posts/${id}/reminders`, { method: 'POST' })
}

export function removeReminder(id) {
  return request(`/api/food-posts/${id}/reminders`, { method: 'DELETE' })
}

/* ── Stats ─────────────────────────────────────── */

export function fetchStats() {
  return request('/api/stats')
}