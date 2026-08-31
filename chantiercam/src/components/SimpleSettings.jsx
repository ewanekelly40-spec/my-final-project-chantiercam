import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useLang } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";

export default function SimpleSettings() {
  const { currentUser } = useAuth();
  const { updateItem } = useData();
  const { t, lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [profile, setProfile] = useState({
    name: currentUser.name,
    phone: currentUser.phone || "",
    address: currentUser.address || "",
    emergencyContact: currentUser.emergencyContact || "",
  });

  function saveProfile(e) {
    e.preventDefault();
    updateItem("projectUsers", currentUser.id, profile);
    showToast(t("save"));
  }

  return (
    <div>
      <div className="page-head"><div><h1>{t("settings")}</h1></div></div>

      <div className="settings-grid">
        <div />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>{t("profile")}</h3>
            <form onSubmit={saveProfile} style={{ maxWidth: 420 }}>
              <div className="field">
                <label>{t("fullName")}</label>
                <input className="input" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="field">
                <label>{t("email")}</label>
                <input className="input" value={currentUser.email} disabled />
              </div>
              <div className="field">
                <label>{t("phone")}</label>
                <input className="input" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="field">
                <label>{t("address")}</label>
                <input className="input" value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="field">
                <label>{t("emergencyContact")}</label>
                <input className="input" value={profile.emergencyContact} onChange={(e) => setProfile((p) => ({ ...p, emergencyContact: e.target.value }))} />
              </div>
              <button className="btn btn-primary" type="submit">{t("save")}</button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>{t("language")}</h3>
            <div className="toggle-lang">
              <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>English</button>
              <button className={lang === "fr" ? "active" : ""} onClick={() => setLang("fr")}>Français</button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>{t("theme")}</h3>
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
      </div>
    </div>
  );
}
