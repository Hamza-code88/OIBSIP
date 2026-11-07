// Tiny API client for the pizza backend.
// Base URL comes from VITE_API_URL (see frontend/.env.example);
// it defaults to the local backend on port 5000.
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

function getToken() {
  return localStorage.getItem('pizza_token') || ''
}

function saveSession(token, user) {
  if (token) localStorage.setItem('pizza_token', token)
  if (user) localStorage.setItem('pizza_user', JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem('pizza_token')
  localStorage.removeItem('pizza_user')
}

function loadStoredUser() {
  try {
    const raw = localStorage.getItem('pizza_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

async function register({ name, email, password }) {
  const data = await request('/api/auth/register', { method: 'POST', body: { name, email, password } })
  saveSession(data.token, data.user)
  return data
}

async function login({ email, password }) {
  const data = await request('/api/auth/login', { method: 'POST', body: { email, password } })
  saveSession(data.token, data.user)
  return data
}

async function fetchMe() {
  const data = await request('/api/auth/me', { auth: true })
  saveSession(getToken(), data.user)
  return data.user
}

async function fetchMenu() {
  return request('/api/pizzas')
}

async function placeOrder(selection) {
  return request('/api/orders', { method: 'POST', body: selection, auth: true })
}

export { API_BASE, register, login, fetchMe, fetchMenu, placeOrder, saveSession, clearSession, loadStoredUser, getToken }
