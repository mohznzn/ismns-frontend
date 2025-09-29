// src/lib/useAuth.js
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { auth } from "@/lib/api";

const CACHE_KEY = "auth:me";

const AuthCtx = createContext({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // évite double refresh simultané
  const refreshingRef = useRef(false);

  const readCache = () => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const writeCache = (data) => {
    try {
      if (data) sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
      else sessionStorage.removeItem(CACHE_KEY);
    } catch {
      /* ignore */
    }
  };

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;

      if (!silent) setLoading(true);
      try {
        const me = await auth.me(); // { user: {...} } ou { user: null }
        setUser(me?.user || null);
        writeCache(me || { user: null });
      } catch {
        setUser(null);
        writeCache(null);
      } finally {
        if (!silent) setLoading(false);
        refreshingRef.current = false;
      }
    },
    []
  );

  // Montage : hydrate depuis le cache puis rafraîchit en arrière-plan
  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setUser(cached.user || null);
      setLoading(false);
      // refresh silencieux pour valider/rafraîchir la session
      refresh({ silent: true });
    } else {
      // pas de cache -> on fait un vrai refresh (affiche le skeleton une seule fois)
      refresh();
    }
    // sync entre onglets : si le cache change ailleurs, on s'aligne
    const onStorage = (e) => {
      if (e.key === CACHE_KEY) {
        const next = readCache();
        setUser(next?.user || null);
        // pas de setLoading ici : reste non bloquant
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    writeCache(null);
    setUser(null);
    setLoading(false);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
