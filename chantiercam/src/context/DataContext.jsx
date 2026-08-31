import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { uid } from "../utils/helpers";
import { buildSeed } from "../utils/seed";

const STORAGE_KEY = "chantiercam_data_v1";
const DataContext = createContext(null);

// Keys every store must have. Lets us add new features (e.g. phases) without
// breaking people who already have data saved in localStorage from before.
const REQUIRED_KEYS = [
  "managers", "projects", "projectUsers", "tasks", "materials", "payments",
  "progress", "messages", "notifications", "phases", "documents", "reports",
];

function migrate(store) {
  const next = { ...store };
  REQUIRED_KEYS.forEach((k) => { if (!Array.isArray(next[k])) next[k] = []; });
  return next;
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) {
    console.error("Failed to load store", e);
  }
  const seeded = buildSeed();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

export function DataProvider({ children }) {
  const [store, setStore] = useState(loadStore);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  const update = useCallback((key, updater) => {
    setStore((prev) => ({ ...prev, [key]: updater(prev[key]) }));
  }, []);

  // ---- generic helpers ----
  const addItem = (key, item) => update(key, (list) => [...list, item]);
  const updateItem = (key, id, patch) =>
    update(key, (list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (key, id) => update(key, (list) => list.filter((it) => it.id !== id));

  const pushNotification = (n) => addItem("notifications", { id: uid("notif"), read: false, createdAt: new Date().toISOString(), ...n });

  const resetAll = () => {
    const seeded = buildSeed();
    setStore(seeded);
  };

  const value = {
    store,
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
