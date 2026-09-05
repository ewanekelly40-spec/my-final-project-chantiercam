const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const TOKEN_KEY = "chantiercam_token_v1";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error("Failed to persist token", e);
  }
}

// Convert relative /uploads/ media paths to full backend URLs
export function resolveMediaUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    return `${BACKEND_URL}${url}`;
  }
  return url;
}

// Map frontend store keys to backend API resource routes
const RESOURCE_MAP = {
  managers: "users",
  projects: "projects",
  projectUsers: "users",
  phases: "phases",
  tasks: "tasks",
  materials: "materials",
  payments: "payments",
  progress: "progress",
  documents: "documents",
  reports: "reports",
  messages: "messages",
  notifications: "notifications",
};

export async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, { ...options, headers });
    const json = await res.json().catch(() => ({ ok: false, error: "Invalid JSON response" }));

    if (!res.ok && !json.error) {
      json.error = `HTTP_${res.status}`;
    }
    return json;
  } catch (err) {
    console.error(`[API] Error on ${endpoint}:`, err);
    return { ok: false, error: "networkError", message: err.message };
  }
}

export const api = {
  // Auth
  loginManager: (email, password) =>
    request("/auth/login-manager", { method: "POST", body: JSON.stringify({ email, password }) }),
  loginProjectUser: (role, email, password) =>
    request("/auth/login-user", { method: "POST", body: JSON.stringify({ role, email, password }) }),
  signupManager: (data) =>
    request("/auth/signup-manager", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => request("/auth/me"),

  // Full dynamic store
  getFullStore: () => request("/data"),
  resetDatabase: () => request("/data/reset", { method: "POST" }),

  // Generic dynamic CRUD mapped to backend
  createItem: (key, item) => {
    const resource = RESOURCE_MAP[key] || key;
    return request(`/${resource}`, { method: "POST", body: JSON.stringify(item) });
  },
  updateItem: (key, id, patch) => {
    const resource = RESOURCE_MAP[key] || key;
    return request(`/${resource}/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  },
  deleteItem: (key, id) => {
    const resource = RESOURCE_MAP[key] || key;
    return request(`/${resource}/${id}`, { method: "DELETE" });
  },

  // File / media upload
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request("/upload/single", { method: "POST", body: formData });
  },
  uploadFiles: async (fileList) => {
    const formData = new FormData();
    Array.from(fileList).forEach((f) => formData.append("files", f));
    return request("/upload/multiple", { method: "POST", body: formData });
  },
};

export default api;
