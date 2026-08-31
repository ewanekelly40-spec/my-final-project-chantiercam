import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import { initials } from "../../utils/helpers";

export default function Settings() {
  const { currentUser } = useAuth();
  const { store, updateItem, removeItem, resetAll } = useData();
  const { t, lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone || "", company: currentUser.company || "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const myProjects = store.projects.filter((p) => p.managerId === currentUser.id);
  const myUsers = store.projectUsers.filter((u) => myProjects.some((p) => p.id === u.projectId));

  function saveProfile(e) {
    e.preventDefault();
    updateItem("managers", currentUser.id, profile);
    showToast("Profile updated.");
  }

  function toggleSuspend(u) {
    updateItem("projectUsers", u.id, { suspended: !u.suspended });
    showToast(u.suspended ? "Account reactivated." : "Account suspended.");
  }

  function handleDelete() {
    removeItem("projectUsers", confirmDelete);
    setConfirmDelete(null);
    showToast("Account deleted.");
  }

  function handleReset() {
    resetAll();
    setConfirmReset(false);
    showToast("Demo data has been reset.");
  }

  return (
    <div>
      <div className="page-head"><div><h1>{t("settings")}</h1></div></div>

      <div className="settings-grid">
        <div className="settings-nav">
          <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>{t("profile")}</button>
          <button className={tab === "prefs" ? "active" : ""} onClick={() => setTab("prefs")}>{t("language")} / {t("theme")}</button>
          <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>{t("manageUsers")}</button>
          <button className={tab === "system" ? "active" : ""} onClick={() => setTab("system")}>System</button>
        </div>

        <div className="card">
          {tab === "profile" && (
            <form onSubmit={saveProfile} style={{ maxWidth: 420 }}>
              <div className="field">
                <label>{t("fullName")}</label>
                <input className="input" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="field">
                <label>{t("email")}</label>
                <input className="input" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="field">
                <label>{t("phone")}</label>
                <input className="input" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="field">
                <label>{t("company")}</label>
                <input className="input" value={profile.company} onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))} />
              </div>
              <button className="btn btn-primary" type="submit">{t("save")}</button>
            </form>
          )}

          {tab === "prefs" && (
            <div>
              <div className="field">
                <label>{t("language")}</label>
                <div className="toggle-lang">
                  <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>English</button>
                  <button className={lang === "fr" ? "active" : ""} onClick={() => setLang("fr")}>Français</button>
                </div>
              </div>
              <div className="spacer-24" />
              <div className="field">
                <label>{t("theme")}</label>
                <div className="theme-options">
                  <div className={`theme-opt ${theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")}>
                    <div className="swatch light" />
                    <span>{t("themeLight")}</span>
                  </div>
                  <div className={`theme-opt ${theme === "blue" ? "active" : ""}`} onClick={() => setTheme("blue")}>
                    <div className="swatch blue" />
                    <span>{t("themeBlue")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div>
              {myUsers.length === 0 ? (
                <div className="empty-state"><p>{t("noData")}</p></div>
              ) : (
                myUsers.map((u) => {
                  const proj = myProjects.find((p) => p.id === u.projectId);
                  return (
                    <div className="userline" key={u.id}>
                      <div className="avatar">{initials(u.name)}</div>
                      <div className="meta">
                        <div className="name">{u.name} <span className="badge badge-gray" style={{ marginLeft: 6 }}>{t(u.role)}</span></div>
                        <div className="sub">{u.email} · {proj?.name}</div>
                      </div>
                      <div className="btns">
                        <button className="btn btn-outline btn-sm" onClick={() => toggleSuspend(u)}>{u.suspended ? t("unsuspend") : t("suspend")}</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(u.id)}>{t("delete")}</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === "system" && (
            <div>
              <h3 style={{ fontSize: 15.5, marginBottom: 8 }}>Reset Demo Data</h3>
              <p className="text-muted" style={{ fontSize: 13.5, marginBottom: 14, lineHeight: 1.6 }}>
                This will erase all projects, users, tasks, materials, payments and messages stored in this browser, and restore the original demo dataset.
              </p>
              <button className="btn btn-danger" onClick={() => setConfirmReset(true)}>Reset All Data</button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} />
      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)} onConfirm={handleReset} message="This will permanently erase all data in this browser and restore the demo dataset." />
    </div>
  );
}
