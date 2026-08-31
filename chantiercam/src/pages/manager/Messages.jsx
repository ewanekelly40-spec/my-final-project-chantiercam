import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import useActiveProject from "../../utils/useActiveProject";
import ChatBox from "../../components/ChatBox";

export default function Messages() {
  const { currentUser } = useAuth();
  const { store } = useData();
  const { t } = useLang();
  const { project, projectId } = useActiveProject();

  const contacts = store.projectUsers
    .filter((u) => u.projectId === projectId)
    .map((u) => ({ id: u.id, name: `${u.name} (${t(u.role)})` }));

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t("messages")}</h1>
          <p>{project?.name}</p>
        </div>
      </div>
      <ChatBox projectId={projectId} currentUserId={currentUser.id} contacts={contacts} />
    </div>
  );
}
