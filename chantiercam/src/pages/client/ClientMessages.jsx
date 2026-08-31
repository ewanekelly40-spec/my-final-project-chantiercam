import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import ChatBox from "../../components/ChatBox";

export default function ClientMessages() {
  const { currentUser, activeProjectId } = useAuth();
  const { store } = useData();
  const { t } = useLang();

  const project = store.projects.find((p) => p.id === activeProjectId);
  const manager = store.managers.find((m) => m.id === project?.managerId);
  const contacts = manager ? [{ id: manager.id, name: `${manager.name} (${t("siteManager")})` }] : [];

  return (
    <div>
      <div className="page-head"><div><h1>{t("messages")}</h1></div></div>
      <ChatBox projectId={activeProjectId} currentUserId={currentUser.id} contacts={contacts} />
    </div>
  );
}
