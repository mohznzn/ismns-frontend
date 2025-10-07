// src/lib/api.js

// -------- Base URL backend --------
function sanitizeBase(url) {
  const u = (url || "").trim().replace(/\/+$/, "");
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

// Priorité à NEXT_PUBLIC_API_BASE, sinon NEXT_PUBLIC_BACKEND_URL, sinon localhost
export const API_BASE = sanitizeBase(
  process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000"
);

// -------- Utils --------
function isJson(res) {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json");
}

async function parse(res) {
  if (isJson(res)) return res.json();
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

// -------- Fetch générique (avec cookies) --------
async function apiFetch(path, init = {}) {
  if (!API_BASE) throw new Error("API base URL is not set");

  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    cache: "no-store",
    credentials: "include", // indispensable pour le cookie de session
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

// -------- Helpers HTTP --------
export function apiGet(path, { headers, ...init } = {}) {
  return apiFetch(path, { method: "GET", headers, ...init });
}

export function apiPost(path, body, { headers, ...init } = {}) {
  return apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: JSON.stringify(body || {}),
    ...init,
  });
}

// multipart/form-data (NE PAS fixer Content-Type)
export function apiPostForm(path, formData, { headers, ...init } = {}) {
  return apiFetch(path, {
    method: "POST",
    // Pas de 'Content-Type' ici: le navigateur ajoute boundary + type automatiquement
    body: formData,
    headers,
    ...init,
  });
}

export function apiPatch(path, body, { headers, ...init } = {}) {
  return apiFetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: JSON.stringify(body || {}),
    ...init,
  });
}

export function apiDelete(path, { headers, ...init } = {}) {
  return apiFetch(path, { method: "DELETE", headers, ...init });
}

// -------- Querystring helper --------
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

  // Renvoie { score, passed, pass_threshold, ... }
  finishAttempt: (attemptId) =>
    apiPost(`/attempts/${encodeURIComponent(attemptId)}/finish`, {}),

  /**
   * Envoi du formulaire post-QCM avec upload de CV (multipart).
   * payload attendu:
   * {
   *   salary_amount: number|null,
   *   salary_currency: "EUR"|"USD"|...,
   *   salary_period: "year"|"month",
   *   availability_text: string,
   *   cv_file: File (OBLIGATOIRE)
   * }
   */
  intakeAttempt: async (attemptId, payload = {}) => {
    const path = `/attempts/${encodeURIComponent(attemptId)}/intake`;
    const fd = new FormData();

    fd.append("salary_amount", payload.salary_amount ?? "");
    fd.append("salary_currency", payload.salary_currency ?? "");
    fd.append("salary_period", payload.salary_period ?? "");
    fd.append("availability_text", payload.availability_text ?? "");

    const file = payload.cv_file;
    if (!(file instanceof File)) {
      throw new Error("cv_file manquant (fichier requis)");
    }
    fd.append("cv_file", file);

    return apiPostForm(path, fd);
  },

  // Compat: ancien nom utilisé par certaines pages -> délègue au nouveau
  submitIntake: (attemptId, payload = {}) =>
    publicApi.intakeAttempt(attemptId, payload),
};

// ================= ADMIN (protégé par cookie) =================
export const admin = {
  createDraftFromJD: ({ job_description, language = "en" }) =>
    apiPost(`/qcm/create_draft_from_jd`, {
      job_description,
      language,
    }),

  publishQcm: (qcmId) =>
    apiPost(`/qcm/${encodeURIComponent(qcmId)}/publish`, {}),

  getQcmAdmin: (qcmId) => apiGet(`/qcm/${encodeURIComponent(qcmId)}/admin`),

  regenerateQuestion: (qcmId, qid) =>
    apiPost(
      `/qcm/${encodeURIComponent(qcmId)}/question/${encodeURIComponent(
        qid
      )}/regenerate`,
      {}
    ),

  listMyQcms: () => apiGet(`/admin/qcm`),

  listAttempts: (params = {}) => apiGet(withQuery(`/admin/attempts`, params)),

  getQcmResults: (qcmId) =>
    apiGet(`/admin/qcm/${encodeURIComponent(qcmId)}/results`),

  getAttemptDetail: (attemptId) =>
    apiGet(`/admin/attempts/${encodeURIComponent(attemptId)}`),

  // ⇩⇩ NOUVEAU : rapport consolidé (score, CV, matching) ⇩⇩
  getAttemptReport: (attemptId) =>
    apiGet(`/admin/attempts/${encodeURIComponent(attemptId)}/report`),
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
