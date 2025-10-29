// src/api.js
const API_URL = "http://localhost:5000";

// Obtener token del almacenamiento local
function getToken() {
  return localStorage.getItem("token");
}

// Helper: llamada genérica a la API Flask
async function api(endpoint, options = {}) {
  const token = getToken();

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };

  const res = await fetch(`${API_URL}${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API request failed");
  return data;
}

// ---------- AUTH ----------
export async function register(email, password) {
  const data = await api("/auth/register", {
    method: "POST",
    body: { email, password },
  });
  localStorage.setItem("token", data.token);
  return data;
}

export async function login(email, password) {
  const data = await api("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  localStorage.setItem("token", data.token);
  return data;
}

export function logout() {
  localStorage.removeItem("token");
}

// ---------- HABITS ----------
export async function getWeekly(date) {
  const params = date ? `?date=${date}` : "";
  return await api(`/habits/weekly${params}`);
}

export async function updateHabit(type, op, value = null, date = null) {
  const body = { type, op };
  if (value !== null) body.value = value;
  if (date) body.date = date;
  return await api("/habits/update", { method: "POST", body });
}

// ---------- GOALS ----------
export async function getGoals() {
  return await api("/goals");
}

export async function updateGoals(goals) {
  return await api("/goals", {
    method: "POST",
    body: { goals },
  });
}

// ---------- EXPORT DEFAULT ----------
export default {
  register,
  login,
  logout,
  getWeekly,
  updateHabit,
  getGoals,
  updateGoals,
  getToken,
};
