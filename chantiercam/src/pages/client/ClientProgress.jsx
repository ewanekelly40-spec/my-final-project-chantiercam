import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import ProgressFeed from "../../components/ProgressFeed";
import PhasesSummary from "../../components/PhasesSummary";

export default function ClientProgress() {
  const { activeProjectId } = useAuth();
  const { store } = useData();
  const { t } = useLang();

  const project = store.projects.find((p) => p.id === activeProjectId);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t("progress")}</h1>
          <p>{project?.name} — {project?.location}</p>
          <p className="text-muted" style={{ fontSize: 12.5, marginTop: 4 }}>Click any photo or video to view it full size and download it.</p>
        </div>
      </div>
      <PhasesSummary projectId={activeProjectId} />
      <ProgressFeed projectId={activeProjectId} canAdd={false} />
    </div>
  );
}
