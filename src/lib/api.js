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

// ================= Gestion d'Erreurs Améliorée =================

/**
 * Messages d'erreur user-friendly selon le code HTTP
 */
function getUserFriendlyMessage(status, data) {
  // Messages personnalisés du backend
  if (data?.message || data?.error) {
    return data.message || data.error;
  }

  // Messages par défaut selon le code HTTP
  const messages = {
    400: "Requête invalide. Vérifiez vos données.",
    401: "Vous n'êtes pas connecté. Veuillez vous connecter.",
    403: "Accès interdit. Vous n'avez pas les permissions nécessaires.",
    404: "Ressource non trouvée.",
    409: "Cette ressource existe déjà.",
    413: "Fichier trop volumineux.",
    422: "Impossible de traiter ce fichier.",
    429: "Trop de requêtes. Veuillez réessayer plus tard.",
    500: "Erreur serveur. Veuillez réessayer plus tard.",
    502: "Service temporairement indisponible. Réessayez dans quelques instants.",
    503: "Service indisponible. Réessayez plus tard.",
  };

  return messages[status] || `Erreur ${status}`;
}

function buildError(res, data) {
  const msg = getUserFriendlyMessage(res.status, data);
  const err = new Error(msg);
  err.status = res.status;
  err.data = data;
  err.userMessage = msg;
  return err;
}

// -------- Fetch générique (avec cookies + retry) --------
async function apiFetch(path, init = {}, retries = 2) {
  if (!API_BASE) throw new Error("API base URL is not set");

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
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
      
      // Gestion spéciale des erreurs d'authentification
      if (res.status === 401) {
        // Rediriger vers login si non authentifié (sauf si déjà sur /login)
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      if (!res.ok) {
        const error = buildError(res, data);
        // Ne pas retry sur erreurs 4xx (sauf 429 rate limit)
        // Accepter 202 Accepted comme succès (utilisé pour les tâches asynchrones)
        if (res.status === 202) {
          return data;
        }
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          throw error;
        }
        lastError = error;
        // Retry sur erreurs réseau, 5xx, ou 429
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000));
          continue;
        }
        throw error;
      }

      return data;
    } catch (err) {
      // Si erreur réseau (pas de réponse), retry
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        lastError = err;
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000));
          continue;
        }
      }
      throw err;
    }
  }

  throw lastError || new Error("Requête échouée après plusieurs tentatives");
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
  register: (email, password, phone_number, first_name, last_name) => apiPost(`/auth/register`, { email, password, phone_number, first_name, last_name }),
  verifyEmail: (email, code, user_id) => apiPost(`/auth/verify-email`, { email, code, user_id }),
  resendVerificationCode: (email, context = "register") => apiPost(`/auth/resend-verification-code`, { email, context }),
  login: (email, password, verification_code) => apiPost(`/auth/login`, { email, password, verification_code }),
  logout: () => apiPost(`/auth/logout`, {}),
  getOpenAIUsage: () => apiGet(`/auth/openai_usage`),
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
  // Extraire uniquement les skills depuis la JD (via Celery, retourne task_id)
  extractSkillsFromJD: async ({ job_description }) => {
    const response = await apiPost(`/qcm/extract_skills_from_jd`, {
      job_description,
    });
    
    // Si on reçoit un task_id (code 202), retourner l'objet avec task_id
    // Sinon, retourner directement les skills (fallback synchrone)
    if (response.task_id) {
      return { task_id: response.task_id };
    }
    
    // Format synchrone (fallback)
    return response;
  },

  // Créer un QCM avec progression en temps réel (retourne task_id)
  createDraftFromJD: ({ job_description, language = "en", confirmed_skills }) =>
    apiPost(`/qcm/create_draft_from_jd`, {
      job_description,
      language,
      ...(confirmed_skills ? { confirmed_skills } : {}),
    }),

  // Écouter la progression d'une tâche Celery via SSE (générique)
  listenToTaskProgress: (taskId, onProgress, onError) => {
    const baseUrl = API_BASE.replace(/\/$/, "");
    // EventSource envoie automatiquement les cookies, pas besoin de withCredentials
    const url = `${baseUrl}/tasks/${encodeURIComponent(taskId)}/stream`;
    
    let eventSource;
    let closed = false;
    
    try {
      // EventSource n'accepte pas d'options dans le constructeur
      // Les cookies sont envoyés automatiquement par le navigateur
      eventSource = new EventSource(url);
    } catch (err) {
      console.error("Failed to create EventSource:", err);
      onError(err);
      return () => {}; // Cleanup function vide
    }
    
    eventSource.onmessage = (event) => {
      try {
        const progress = JSON.parse(event.data);
        console.log("[listenToTaskProgress] Received progress:", progress);
        
        // Vérifier si c'est une erreur d'authentification
        if (progress.status === "error" && progress.error === "unauthenticated") {
          closed = true;
          eventSource.close();
          onError(new Error("unauthenticated"));
          return;
        }
        
        onProgress(progress);
        
        // Fermer la connexion si terminé
        if (progress.status === "completed" || progress.status === "error") {
          closed = true;
          eventSource.close();
        }
      } catch (err) {
        console.error("Error parsing progress:", err, "Raw data:", event.data);
        if (!closed) {
          onError(err);
        }
      }
    };
    
    eventSource.onopen = () => {
      console.log("[listenToTaskProgress] SSE connection opened for task:", taskId);
    };
    
    eventSource.onerror = (err) => {
      // Ne pas appeler onError si déjà fermé ou si c'est juste la fermeture normale
      if (closed) {
        return;
      }
      
      const readyState = eventSource.readyState;
      console.error(`[listenToTaskProgress] SSE error for task ${taskId}:`, {
        readyState,
        readyStateText: readyState === EventSource.CONNECTING ? 'CONNECTING' : 
                        readyState === EventSource.OPEN ? 'OPEN' : 'CLOSED',
        error: err
      });
      
      // EventSource peut déclencher onerror même lors d'une fermeture normale
      // Vérifier l'état de la connexion
      if (readyState === EventSource.CLOSED) {
        // Connexion fermée normalement ou après erreur
        console.log("[listenToTaskProgress] SSE connection closed normally");
        return;
      }
      
      // Si on est en train de se connecter ou ouvert, c'est une vraie erreur
      if (readyState === EventSource.CONNECTING || readyState === EventSource.OPEN) {
        if (!closed) {
          closed = true;
          eventSource.close();
          onError(new Error(`SSE connection error (state: ${readyState === EventSource.CONNECTING ? 'CONNECTING' : 'OPEN'})`));
        }
      }
    };
    
    // Retourner une fonction de cleanup
    return () => {
      if (!closed && eventSource) {
        closed = true;
        eventSource.close();
      }
    };
  },

  // Écouter la progression de génération via SSE (legacy, utilise listenToTaskProgress)
  listenToGenerationProgress: (taskId, onProgress, onError) => {
    return admin.listenToTaskProgress(taskId, onProgress, onError);
  },

  publishQcm: (qcmId, passThreshold) =>
    apiPost(`/qcm/${encodeURIComponent(qcmId)}/publish`, { pass_threshold: passThreshold }),

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

  // Rapport IA fusionné (JD + CV + QCM)
  getAttemptAIReport: (attemptId) =>
    apiGet(`/admin/attempts/${encodeURIComponent(attemptId)}/ai_report`),

  downloadAttemptAIReportPdf: async (attemptId, regenerate = false) => {
    if (!API_BASE) throw new Error("API base URL is not set");
    const url = `${API_BASE}/admin/attempts/${encodeURIComponent(attemptId)}/ai_report_pdf${regenerate ? "?regenerate=true" : ""}`;
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      const contentType = res.headers.get("content-type") || "";
      let payload = null;
      if (contentType.includes("application/json")) {
        try {
          payload = await res.json();
        } catch {
          payload = null;
        }
      } else {
        try {
          payload = await res.text();
        } catch {
          payload = null;
        }
      }

      const message =
        payload?.message || payload?.error || `Téléchargement impossible (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      err.data = payload;
      throw err;
    }

    const blob = await res.blob();
    const disposition = res.headers.get("content-disposition") || "";
    let filename = `ai_report_${attemptId}.pdf`;
    const match = disposition.match(/filename="([^"]+)"/i);
    if (match && match[1]) {
      filename = match[1];
    }

    return { blob, filename };
  },

  // Récupérer l'URL du CV pour affichage dans une popup
  getAttemptCvUrl: (attemptId) => {
    if (!API_BASE) throw new Error("API base URL is not set");
    return `${API_BASE}/admin/attempts/${encodeURIComponent(attemptId)}/cv?inline=true`;
  },
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

// ================= Helper pour gérer les erreurs dans les composants =================

/**
 * Extrait un message d'erreur user-friendly depuis une erreur API
 * @param {Error} error - Erreur de l'API
 * @returns {string} Message user-friendly
 */
export function getErrorMessage(error) {
  if (!error) return "Une erreur inattendue s'est produite.";
  
  // Message user-friendly si disponible
  if (error.userMessage) return error.userMessage;
  
  // Message standard de l'erreur
  if (error.message) return error.message;
  
  // Message générique
  return "Une erreur s'est produite. Veuillez réessayer.";
}

/**
 * Vérifie si une erreur est une erreur réseau (connexion)
 */
export function isNetworkError(error) {
  return (
    error?.name === "TypeError" &&
    (error?.message?.includes("fetch") || error?.message?.includes("network"))
  );
}

/**
 * Vérifie si une erreur nécessite une ré-authentification
 */
export function isAuthError(error) {
  return error?.status === 401 || error?.status === 403;
}
