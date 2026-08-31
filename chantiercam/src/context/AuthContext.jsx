import React, { createContext, useContext, useState, useEffect } from "react";
import { useData } from "./DataContext";
import { uid } from "../utils/helpers";

const SESSION_KEY = "chantiercam_session_v1";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { store, addItem } = useData();
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

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [session]);

  useEffect(() => {
    if (activeProjectId) localStorage.setItem("chantiercam_active_project", activeProjectId);
  }, [activeProjectId]);

  function loginManager(email, password) {
    const found = store.managers.find(
      (m) => m.email.toLowerCase() === email.trim().toLowerCase() && m.password === password
    );
    if (!found) return { ok: false, error: "loginFailed" };
    if (found.suspended) return { ok: false, error: "suspended" };
    setSession({ role: "manager", userId: found.id });
    return { ok: true };
  }

  function loginProjectUser(role, email, password) {
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
  }

  function signupManager({ name, email, company, phone, password }) {
    const exists = store.managers.some((m) => m.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) return { ok: false, error: "emailInUse" };
    const id = uid("mgr");
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
  }

  function logout() {
    setSession(null);
    setActiveProjectId(null);
    localStorage.removeItem("chantiercam_active_project");
  }

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
