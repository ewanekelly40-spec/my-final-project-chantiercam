import React from "react";
import { useLang } from "../../context/LanguageContext";
import useActiveProject from "../../utils/useActiveProject";
import ProgressFeed from "../../components/ProgressFeed";
import PhasesSummary from "../../components/PhasesSummary";

export default function Progress() {
  const { t } = useLang();
  const { project, projectId } = useActiveProject();

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t("progress")}</h1>
          <p>{project?.name}</p>
        </div>
      </div>
      <PhasesSummary projectId={projectId} />
      <ProgressFeed projectId={projectId} canAdd />
    </div>
  );
}
