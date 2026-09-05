import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useData } from "./DataContext";
import api, { setToken, getToken } from "../services/api";

const SESSION_KEY = "chantiercam_session_v1";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { store, addItem, refreshStore } = useData();

  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [activeProjectId, setActiveProjectId] = useState(() => {
    try {
      return localStorage.getItem("chantiercam_active_project") || null;
    } catch {
      return null;
    }
  });

  // Verify session with backend on mount if token exists
  useEffect(() => {
    async function checkAuth() {
      const token = getToken();
      if (token) {
        try {
          const res = await api.getMe();
          if (res && res.ok && res.session) {
            setSession(res.session);
            if (res.activeProjectId) {
              setActiveProjectId(res.activeProjectId);
            }
          }
        } catch (e) {
          console.warn("[AuthContext] Token verification failed:", e);
        }
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [session]);

  useEffect(() => {
    if (activeProjectId) localStorage.setItem("chantiercam_active_project", activeProjectId);
  }, [activeProjectId]);

  const loginManager = useCallback(
    async (email, password) => {
      try {
        const res = await api.loginManager(email, password);
        if (res && res.ok) {
          if (res.token) setToken(res.token);
          setSession(res.session);
          await refreshStore();
          return { ok: true };
        }
        if (res && res.error) {
          return { ok: false, error: res.error };
        }
      } catch (err) {
        console.warn("[AuthContext] Backend login error, attempting fallback", err);
      }

      // Offline / Local fallback if backend unavailable
      const found = store.managers.find(
        (m) => m.email.toLowerCase() === email.trim().toLowerCase() && m.password === password
      );
      if (!found) return { ok: false, error: "loginFailed" };
      if (found.suspended) return { ok: false, error: "suspended" };
      setSession({ role: "manager", userId: found.id });
      return { ok: true };
    },
    [store.managers, refreshStore]
  );

  const loginProjectUser = useCallback(
    async (role, email, password) => {
      try {
        const res = await api.loginProjectUser(role, email, password);
        if (res && res.ok) {
          if (res.token) setToken(res.token);
          setSession(res.session);
          if (res.activeProjectId) {
            setActiveProjectId(res.activeProjectId);
          }
          await refreshStore();
          return { ok: true };
        }
        if (res && res.error) {
          return { ok: false, error: res.error };
        }
      } catch (err) {
        console.warn("[AuthContext] Backend login user error, attempting fallback", err);
      }

      // Offline / Local fallback
      const found = store.projectUsers.find(
        (u) =>
          u.role === role &&
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.password === password
      );
      if (!found) return { ok: false, error: "loginFailed" };
      if (found.suspended) return { ok: false, error: "suspended" };
      setSession({ role, userId: found.id });
      setActiveProjectId(found.projectId);
      return { ok: true };
    },
    [store.projectUsers, refreshStore]
  );

  const signupManager = useCallback(
    async ({ name, email, company, phone, password }) => {
      try {
        const res = await api.signupManager({ name, email, company, phone, password });
        if (res && res.ok) {
          if (res.token) setToken(res.token);
          setSession(res.session);
          await refreshStore();
          return { ok: true };
        }
        if (res && res.error) {
          return { ok: false, error: res.error };
        }
      } catch (err) {
        console.warn("[AuthContext] Backend signup error, attempting fallback", err);
      }

      // Fallback
      const exists = store.managers.some((m) => m.email.toLowerCase() === email.trim().toLowerCase());
      if (exists) return { ok: false, error: "emailInUse" };
      const id = `mgr_${Date.now()}`;
      addItem("managers", {
        id,
        role: "manager",
        name,
        email: email.trim(),
        password,
        company,
        phone,
        createdAt: new Date().toISOString(),
        suspended: false,
      });
      setSession({ role: "manager", userId: id });
      return { ok: true };
    },
    [store.managers, addItem, refreshStore]
  );

  const logout = useCallback(() => {
    setSession(null);
    setActiveProjectId(null);
    setToken(null);
    localStorage.removeItem("chantiercam_active_project");
  }, []);

  const currentUser = (() => {
    if (!session) return null;
    if (session.role === "manager") return store.managers.find((m) => m.id === session.userId) || null;
    return store.projectUsers.find((u) => u.id === session.userId) || null;
  })();

  const value = {
    session,
    currentUser,
    activeProjectId,
    setActiveProjectId,
    loginManager,
    loginProjectUser,
    signupManager,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
