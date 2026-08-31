import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useLang } from "../context/LanguageContext";
import {
  IconBell, IconLogOut, IconMenu, IconX,
} from "./Icons";
import { initials, timeAgo, uid, daysUntil } from "../utils/helpers";

export default function AppLayout({ navItems, roleLabel, pageTitle }) {
  const { currentUser, logout, activeProjectId, setActiveProjectId, session } = useAuth();
  const { store, addItem, updateItem } = useData();
  const { t } = useLang();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isManager = session?.role === "manager";

  // Due-date reminders: fire once per task, when the deadline is within 2 days (or already overdue).
  useEffect(() => {
    if (!currentUser) return;
    const relevantTasks = isManager
      ? store.tasks.filter((tk) => store.projects.some((p) => p.id === tk.projectId && p.managerId === currentUser.id))
      : store.tasks.filter((tk) => tk.assignedTo === currentUser.id);

    relevantTasks.forEach((tk) => {
      if (tk.reminderSent || !tk.dueDate || tk.status === "completed" || tk.status === "refused") return;
      const d = daysUntil(tk.dueDate);
      if (d === null || d > 2) return;
      const overdue = d < 0;
      addItem("notifications", {
        id: uid("notif"),
        projectId: tk.projectId,
        userId: currentUser.id,
        title: overdue ? t("taskOverdueTitle") : t("taskDueSoonTitle"),
        message: `${tk.title} ${overdue ? t("taskOverdueMsg") : t("taskDueSoonMsg")}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
      updateItem("tasks", tk.id, { reminderSent: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, store.tasks.length]);

  const myProjects = isManager
    ? store.projects.filter((p) => p.managerId === currentUser?.id)
    : store.projects.filter((p) => p.id === activeProjectId);

  const myNotifications = store.notifications
    .filter((n) => n.userId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const unread = myNotifications.filter((n) => !n.read).length;

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar no-print ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <img src="/logo.png" alt="ChantierCam" />
          <span>Chantier<b>Cam</b></span>
        </div>

        {isManager && myProjects.length > 0 && (
          <div className="project-switcher">
            <div className="label">{t("currentProject")}</div>
            <select
              value={activeProjectId || ""}
              onChange={(e) => setActiveProjectId(e.target.value)}
            >
              {myProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        <nav className="nav-group" style={{ flex: 1, overflowY: "auto" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <item.icon />
              <span>{t(item.labelKey)}</span>
              {item.dot ? <span className="dot">{item.dot}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{initials(currentUser?.name || "U")}</div>
            <div className="meta">
              <div className="name">{currentUser?.name}</div>
              <div className="role">{roleLabel}</div>
            </div>
          </div>
          <div className="nav-link" style={{ marginTop: 6 }} onClick={handleLogout}>
            <IconLogOut />
            <span>{t("logout")}</span>
          </div>
        </div>
      </aside>

      <div className="main-col">
        <header className="topbar no-print">
          <div className="flex-gap">
            <div className="icon-btn mobile-topbar-toggle" onClick={() => setMobileOpen((o) => !o)}>
              {mobileOpen ? <IconX /> : <IconMenu />}
            </div>
            <h2>{pageTitle}</h2>
          </div>
          <div className="right">
            <div style={{ position: "relative" }} ref={notifRef}>
              <div className="icon-btn" onClick={() => setNotifOpen((o) => !o)}>
                <IconBell />
                {unread > 0 && <span className="badge-dot" />}
              </div>
              {notifOpen && (
                <NotificationsPanel notifications={myNotifications} onNavigate={() => setNotifOpen(false)} />
              )}
            </div>
          </div>
        </header>
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function NotificationsPanel({ notifications, onNavigate }) {
  const { t } = useLang();
  const { updateItem } = useData();

  function markAllRead() {
    notifications.forEach((n) => { if (!n.read) updateItem("notifications", n.id, { read: true }); });
  }

  return (
    <div className="notif-panel">
      <div className="head">
        <strong style={{ fontSize: 14 }}>{t("notifications")}</strong>
        <button className="btn btn-ghost btn-sm" onClick={markAllRead}>{t("markAllRead")}</button>
      </div>
      {notifications.length === 0 ? (
        <div className="empty-state" style={{ padding: 30 }}>
          <IconBell />
          <p>{t("noNotifications")}</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`notif-item ${n.read ? "" : "unread"}`}
            onClick={() => { updateItem("notifications", n.id, { read: true }); onNavigate?.(); }}
          >
            <span className="dot2" />
            <div>
              <div className="title">{n.title}</div>
              <div className="msg">{n.message}</div>
              <div className="time">{timeAgo(n.createdAt)}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
