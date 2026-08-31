import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import {
  IconUser, IconHardHat, IconClipboard, IconMail, IconLock, IconEye, IconEyeOff,
  IconPackage, IconCheckSquare, IconDollar, IconGlobe, IconMoon,
} from "../components/Icons";

const ROLES = [
  { key: "client", labelKey: "client", icon: IconUser },
  { key: "worker", labelKey: "worker", icon: IconHardHat },
  { key: "manager", labelKey: "siteManager", icon: IconClipboard },
];

export default function Landing() {
  const [role, setRole] = useState("client");
  const [mode, setMode] = useState("login"); // login | signup (signup only for manager)
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ email: "", password: "", name: "", company: "", phone: "", confirm: "" });

  const { loginManager, loginProjectUser, signupManager } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function switchRole(r) {
    setRole(r);
    setMode("login");
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!form.name || !form.email || !form.company || !form.password || !form.confirm) {
        setError(t("fillAllFields"));
        return;
      }
      if (form.password !== form.confirm) {
        setError(t("passwordsNoMatch"));
        return;
      }
      const res = signupManager({ name: form.name, email: form.email, company: form.company, phone: form.phone, password: form.password });
      if (!res.ok) {
        setError(t(res.error));
        return;
      }
      showToast(`${t("welcomeBack")}, ${form.name.split(" ")[0]}!`);
      navigate("/manager");
      return;
    }

    if (!form.email || !form.password) {
      setError(t("fillAllFields"));
      return;
    }

    const res = role === "manager" ? loginManager(form.email, form.password) : loginProjectUser(role, form.email, form.password);
    if (!res.ok) {
      setError(res.error === "suspended" ? t("suspended") : t("loginFailed"));
      return;
    }
    navigate(role === "manager" ? "/manager" : role === "worker" ? "/worker" : "/client");
  }

  return (
    <div className="landing-wrap">
      <div className="landing-card">
        <div className="landing-hero">
          <div className="landing-topbar">
            <button className="chip-toggle" onClick={toggleLang} type="button">
              <IconGlobe style={{ width: 14, height: 14 }} />
              {lang.toUpperCase()}
            </button>
            <button className="chip-toggle" onClick={toggleTheme} type="button">
              <IconMoon style={{ width: 14, height: 14 }} />
              {theme === "light" ? t("themeLight") : t("themeBlue")}
            </button>
          </div>

          <img src="/logo.png" alt="ChantierCam logo" className="logo-badge" />
          <h1>Chantier<span>Cam</span></h1>
          <p className="tagline">{t("tagline")}</p>
          <div className="feat-row">
            <span className="feat-pill"><IconPackage style={{ width: 15, height: 15 }} /> {t("featMaterial")}</span>
            <span className="feat-pill"><IconCheckSquare style={{ width: 15, height: 15 }} /> {t("featTask")}</span>
            <span className="feat-pill"><IconDollar style={{ width: 15, height: 15 }} /> {t("featExpense")}</span>
          </div>
        </div>

        <div className="landing-form">
          {mode === "login" ? (
            <>
              <h2>{t("welcomeBack")}</h2>
              <p className="sub">{t("accessDashboard")}</p>

              <div className="role-tabs">
                {ROLES.map((r) => (
                  <div
                    key={r.key}
                    className={`role-tab ${role === r.key ? "active" : ""}`}
                    onClick={() => switchRole(r.key)}
                  >
                    <r.icon />
                    {t(r.labelKey)}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>{t("email")}</label>
                  <div className="input-wrap">
                    <IconMail />
                    <input
                      className="input"
                      type="email"
                      placeholder="user@company.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <div className="form-toprow">
                    <label style={{ marginBottom: 0 }}>{t("password")}</label>
                    <a className="link" href="#!" onClick={(e) => { e.preventDefault(); setShowInfo(true); }}>{t("forgotPassword")}</a>
                  </div>
                  <div className="input-wrap">
                    <IconLock />
                    <input
                      className="input"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                    />
                    <span className="input-eye" onClick={() => setShowPw((s) => !s)}>
                      {showPw ? <IconEyeOff /> : <IconEye />}
                    </span>
                  </div>
                </div>

                <label className="checkbox-row" style={{ marginBottom: 18 }}>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  {t("remember")}
                </label>

                {error && <p style={{ color: "var(--danger)", fontSize: 13.5, marginBottom: 14 }}>{error}</p>}

                <button className="btn btn-primary btn-block" type="submit">
                  {t("secureAccess")} →
                </button>
              </form>

              {role === "manager" ? (
                <p className="auth-footer">
                  {t("noManagerAccount")}{" "}
                  <a href="#!" onClick={(e) => { e.preventDefault(); setMode("signup"); setError(""); }}>{t("createAccount")}</a>
                </p>
              ) : (
                <p className="auth-footer">
                  {t("needVerified")} <a href="#!" onClick={(e) => { e.preventDefault(); setShowInfo(true); }}>{t("requestAccount")}</a>
                </p>
              )}

              {showInfo && (
                <div className="demo-note">{t("workerClientHint")}</div>
              )}

              <div className="demo-note">
                Demo — Manager: manager@chantiercam.com / Manager123 · Worker: jean.fotso@chantiercam.com / Worker123 · Client: sophie.ndjock@chantiercam.com / Client123
              </div>
            </>
          ) : (
            <>
              <h2>{t("createAccount")}</h2>
              <p className="sub">{t("siteManager")} — ChantierCam</p>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>{t("fullName")}</label>
                  <div className="input-wrap">
                    <IconUser />
                    <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Alain Mbarga" />
                  </div>
                </div>
                <div className="row-2">
                  <div className="field">
                    <label>{t("company")}</label>
                    <input className="input" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="MB Construction SARL" />
                  </div>
                  <div className="field">
                    <label>{t("phone")}</label>
                    <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+237 6 90 00 00 00" />
                  </div>
                </div>
                <div className="field">
                  <label>{t("email")}</label>
                  <div className="input-wrap">
                    <IconMail />
                    <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" />
                  </div>
                </div>
                <div className="row-2">
                  <div className="field">
                    <label>{t("password")}</label>
                    <input className="input" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="field">
                    <label>{t("confirmPassword")}</label>
                    <input className="input" type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} placeholder="••••••••" />
                  </div>
                </div>

                {error && <p style={{ color: "var(--danger)", fontSize: 13.5, marginBottom: 14 }}>{error}</p>}

                <button className="btn btn-primary btn-block" type="submit">{t("signUp")}</button>
              </form>

              <p className="auth-footer">
                {t("alreadyHaveAccount")}{" "}
                <a href="#!" onClick={(e) => { e.preventDefault(); setMode("login"); setRole("manager"); setError(""); }}>{t("backToLogin")}</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
