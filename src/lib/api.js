// src/lib/api.js

// Base URL du backend (Render/local) — on supprime les / finaux
export const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000")
  .trim()
  .replace(/\/+$/, "");

// -------- Utils bas niveau --------
function isJsonResponse(res) {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json");
}

async function parse(res) {
  if (isJsonResponse(res)) return res.json();
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text || null;
  }
}

function buildError(res, data) {
  const msg =
    (data && (data.message || data.error || data.detail)) ||
    `HTTP ${res.status}`;
  const err = new Error(msg);
  err.status = res.status;
  err.data = data;
  return err;
}

/**
 * Appel générique fetch avec:
 * - credentials: "include" (cookies d’auth `sid`)
 * - cache: "no-store"
 * - Accept: application/json
 * - merge headers utilisateur
 */
async function apiFetch(path, init = {}) {
  if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL is not set");

  const res = await fetch(`${BACKEND}${path}`, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });

  const data = await parse(res);
  if (!res.ok) throw buildError(res, data);
  return data;
}

// -------- Méthodes HTTP courtes --------
export async function apiGet(path, { headers, ...init } = {}) {
  return apiFetch(path, { method: "GET", headers, ...init });
}

export async function apiPost(path, body, { headers, ...init } = {}) {
  return apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: JSON.stringify(body || {}),
    ...init,
  });
}

export async function apiPatch(path, body, { headers, ...init } = {}) {
  return apiFetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: JSON.stringify(body || {}),
    ...init,
  });
}

export async function apiDelete(path, { headers, ...init } = {}) {
  return apiFetch(path, { method: "DELETE", headers, ...init });
}

// -------- Helpers querystring --------
function withQuery(path, params) {
  if (!params) return path;
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    usp.set(k, String(v));
  });
  const q = usp.toString();
  return q ? `${path}?${q}` : path;
}

// ================= AUTH =================
export const auth = {
  me: () => apiGet(`/auth/me`),
  register: (email, password) => apiPost(`/auth/register`, { email, password }),
  login: (email, password) => apiPost(`/auth/login`, { email, password }),
  logout: () => apiPost(`/auth/logout`, {}),
};

// ================= PUBLIC / CANDIDAT =================
export const publicApi = {
  getQcmByToken: (token) => apiGet(`/public/qcm/${encodeURIComponent(token)}`),
  startAttempt: ({ token, candidate_email }) =>
    apiPost(`/attempts/start`, { token, candidate_email }),
  saveAnswer: (attemptId, { question_id, option_id }) =>
    apiPost(`/attempts/${encodeURIComponent(attemptId)}/answer`, {
      question_id,
      option_id,
    }),
  finishAttempt: (attemptId) =>
    apiPost(`/attempts/${encodeURIComponent(attemptId)}/finish`, {}),
};

// ================= ADMIN (protégé par cookie) =================
export const admin = {
  createDraftFromJD: ({
    job_description,
    language = "en",
    num_questions = 12,
  }) =>
    apiPost(`/qcm/create_draft_from_jd`, {
      job_description,
      language,
      num_questions,
    }),

  publishQcm: (qcmId) =>
    apiPost(`/qcm/${encodeURIComponent(qcmId)}/publish`, {}),

  getQcmAdmin: (qcmId) => apiGet(`/qcm/${encodeURIComponent(qcmId)}/admin`),

  regenerateQuestion: (qcmId, qid) =>
    apiPost(
      `/qcm/${encodeURIComponent(qcmId)}/question/${encodeURIComponent(qid)}/regenerate`,
      {}
    ),

  listMyQcms: () => apiGet(`/admin/qcm`),

  listAttempts: (params = {}) => apiGet(withQuery(`/admin/attempts`, params)),

  getQcmResults: (qcmId) =>
    apiGet(`/admin/qcm/${encodeURIComponent(qcmId)}/results`),

  getAttemptDetail: (attemptId) =>
    apiGet(`/admin/attempts/${encodeURIComponent(attemptId)}`),
};

// ================= Storage local tentative (candidat) =================
export function saveAttemptPayload(attemptId, payload) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`attempt:${attemptId}`, JSON.stringify(payload));
}
export function loadAttemptPayload(attemptId) {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(`attempt:${attemptId}`);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function saveAttemptResult(attemptId, result) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`attempt:${attemptId}:result`, JSON.stringify(result));
}
export function loadAttemptResult(attemptId) {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(`attempt:${attemptId}:result`);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
