import React from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import AppLayout from "./AppLayout";
import { useLang } from "../context/LanguageContext";
import { IconCheckSquare, IconCreditCard, IconMessage, IconSettings } from "./Icons";

export default function WorkerLayout() {
  const { currentUser } = useAuth();
  const { store } = useData();
  const { t } = useLang();

  const unreadMsgs = store.messages.filter((m) => m.to === currentUser.id && !m.read).length;

  const navItems = [
    { to: "/worker", end: true, icon: IconCheckSquare, labelKey: "tasks" },
    { to: "/worker/payments", icon: IconCreditCard, labelKey: "myPayments" },
    { to: "/worker/messages", icon: IconMessage, labelKey: "messages", dot: unreadMsgs > 0 ? unreadMsgs : null },
    { to: "/worker/settings", icon: IconSettings, labelKey: "settings" },
  ];

  return <AppLayout navItems={navItems} roleLabel={t("worker")} pageTitle="ChantierCam" />;
}
