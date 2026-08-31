import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import AppLayout from "./AppLayout";
import { useLang } from "../context/LanguageContext";
import {
  IconHome, IconFolder, IconLayers, IconUsers, IconCheckSquare, IconPackage,
  IconPieChart, IconFileText, IconCamera, IconMessage, IconSettings,
} from "./Icons";

export default function ManagerLayout() {
  const { currentUser, activeProjectId, setActiveProjectId } = useAuth();
  const { store } = useData();
  const { t } = useLang();

  const myProjects = store.projects.filter((p) => p.managerId === currentUser.id);

  useEffect(() => {
    if (!activeProjectId && myProjects.length > 0) {
      setActiveProjectId(myProjects[0].id);
    } else if (activeProjectId && !myProjects.some((p) => p.id === activeProjectId) && myProjects.length > 0) {
      setActiveProjectId(myProjects[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId, myProjects.length]);

  const unreadMsgs = store.messages.filter((m) => m.to === currentUser.id && !m.read).length;

  const navItems = [
    { to: "/manager", end: true, icon: IconHome, labelKey: "overview" },
    { to: "/manager/projects", icon: IconFolder, labelKey: "projects" },
    { to: "/manager/phases", icon: IconLayers, labelKey: "phases" },
    { to: "/manager/users", icon: IconUsers, labelKey: "users" },
    { to: "/manager/tasks", icon: IconCheckSquare, labelKey: "tasks" },
    { to: "/manager/materials", icon: IconPackage, labelKey: "materials" },
    { to: "/manager/finances", icon: IconPieChart, labelKey: "finances" },
    { to: "/manager/reports", icon: IconFileText, labelKey: "reports" },
    { to: "/manager/progress", icon: IconCamera, labelKey: "progress" },
    { to: "/manager/messages", icon: IconMessage, labelKey: "messages", dot: unreadMsgs > 0 ? unreadMsgs : null },
    { to: "/manager/settings", icon: IconSettings, labelKey: "settings" },
  ];

  return <AppLayout navItems={navItems} roleLabel={t("siteManager")} pageTitle="ChantierCam" />;
}
