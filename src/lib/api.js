// src/lib/api.js
export const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function handle(res) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
  }
  return data;
}

export async function apiGet(path, init = {}) {
  const res = await fetch(`${BACKEND}${path}`, {
    ...init,
    method: "GET",
    cache: "no-store",
  });
  return handle(res);
}

export async function apiPost(path, body) {
  const res = await fetch(`${BACKEND}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  return handle(res);
}

// Petites aides pour stocker les données d’une tentative côté navigateur
export function saveAttemptPayload(attemptId, payload) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`attempt:${attemptId}`, JSON.stringify(payload));
}
export function loadAttemptPayload(attemptId) {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(`attempt:${attemptId}`);
  return raw ? JSON.parse(raw) : null;
}
export function saveAttemptResult(attemptId, result) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`attempt:${attemptId}:result`, JSON.stringify(result));
}
export function loadAttemptResult(attemptId) {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(`attempt:${attemptId}:result`);
  return raw ? JSON.parse(raw) : null;
}
