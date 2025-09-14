"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthAPI } from "./api";

const AuthCtx = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await AuthAPI.me();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    await AuthAPI.login(email, password);
    await refresh();
  };
  const register = async (email, password) => {
    await AuthAPI.register(email, password);
    await refresh();
  };
  const logout = async () => {
    await AuthAPI.logout();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}