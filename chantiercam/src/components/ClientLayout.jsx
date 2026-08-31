import React from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import AppLayout from "./AppLayout";
import { useLang } from "../context/LanguageContext";
import { IconCamera, IconMessage, IconSettings } from "./Icons";

export default function ClientLayout() {
  const { currentUser } = useAuth();
  const { store } = useData();
  const { t } = useLang();

  const unreadMsgs = store.messages.filter((m) => m.to === currentUser.id && !m.read).length;

  const navItems = [
    { to: "/client", end: true, icon: IconCamera, labelKey: "progress" },
    { to: "/client/messages", icon: IconMessage, labelKey: "messages", dot: unreadMsgs > 0 ? unreadMsgs : null },
    { to: "/client/settings", icon: IconSettings, labelKey: "settings" },
  ];

  return <AppLayout navItems={navItems} roleLabel={t("client")} pageTitle="ChantierCam" />;
}
