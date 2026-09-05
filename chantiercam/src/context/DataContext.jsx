import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { uid } from "../utils/helpers";
import { buildSeed } from "../utils/seed";
import api from "../services/api";

const STORAGE_KEY = "chantiercam_data_v1";
const DataContext = createContext(null);

const REQUIRED_KEYS = [
  "managers", "projects", "projectUsers", "tasks", "materials", "payments",
  "progress", "messages", "notifications", "phases", "documents", "reports",
];

function migrate(store) {
  const next = { ...store };
  REQUIRED_KEYS.forEach((k) => { if (!Array.isArray(next[k])) next[k] = []; });
  return next;
}

function loadInitialStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) {
    console.error("Failed to load local store cache", e);
  }
  return buildSeed();
}

export function DataProvider({ children }) {
  const [store, setStore] = useState(loadInitialStore);
  const [loading, setLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Fetch full store from MySQL backend on mount
  const refreshStore = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getFullStore();
      if (res && res.ok && res.data) {
        setStore(migrate(res.data));
        setIsBackendConnected(true);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
        } catch (e) {}
      }
    } catch (err) {
      console.warn("[DataContext] Could not sync with MySQL backend, using local state:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStore();
  }, [refreshStore]);

  // Persist to localStorage cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {}
  }, [store]);

  const update = useCallback((key, updater) => {
    setStore((prev) => ({ ...prev, [key]: updater(prev[key] || []) }));
  }, []);

  // ---- Dynamic CRUD methods connected to MySQL ----
  const addItem = useCallback(
    async (key, item) => {
      const itemWithId = { id: item.id || uid(key.slice(0, 3)), ...item };
      // Optimistic update
      update(key, (list) => [...list, itemWithId]);

      try {
        const res = await api.createItem(key, itemWithId);
        if (res && res.ok && res.data) {
          // Sync with server returned record
          update(key, (list) => list.map((it) => (it.id === itemWithId.id ? res.data : it)));
        }
      } catch (err) {
        console.error(`[DataContext] Failed to create ${key} on backend:`, err);
      }
    },
    [update]
  );

  const updateItem = useCallback(
    async (key, id, patch) => {
      // Optimistic update
      update(key, (list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)));

      try {
        const res = await api.updateItem(key, id, patch);
        if (res && res.ok && res.data) {
          update(key, (list) => list.map((it) => (it.id === id ? res.data : it)));
        }
      } catch (err) {
        console.error(`[DataContext] Failed to update ${key} on backend:`, err);
      }
    },
    [update]
  );

  const removeItem = useCallback(
    async (key, id) => {
      // Optimistic delete
      update(key, (list) => list.filter((it) => it.id !== id));

      try {
        await api.deleteItem(key, id);
      } catch (err) {
        console.error(`[DataContext] Failed to delete ${key} on backend:`, err);
      }
    },
    [update]
  );

  const pushNotification = useCallback(
    (n) => {
      const notif = {
        id: uid("notif"),
        read: false,
        createdAt: new Date().toISOString(),
        ...n,
      };
      addItem("notifications", notif);
    },
    [addItem]
  );

  const resetAll = useCallback(async () => {
    try {
      setLoading(true);
      await api.resetDatabase();
      await refreshStore();
    } catch (e) {
      console.warn("[DataContext] Reset fallback to local seed", e);
      const seeded = buildSeed();
      setStore(seeded);
    } finally {
      setLoading(false);
    }
  }, [refreshStore]);

  const value = {
    store,
    loading,
    isBackendConnected,
    refreshStore,
    addItem,
    updateItem,
    removeItem,
    pushNotification,
    resetAll,
    setStore,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
