import React from "react";
import { useLang } from "../context/LanguageContext";

const TASK_MAP = {
  pending: { key: "taskStatusPending", color: "gray" },
  accepted: { key: "taskStatusAccepted", color: "blue" },
  refused: { key: "taskStatusRefused", color: "red" },
  in_progress: { key: "taskStatusInProgress", color: "orange" },
  submitted: { key: "taskStatusSubmitted", color: "blue" },
  completed: { key: "taskStatusCompleted", color: "green" },
};

const PROJECT_MAP = {
  planning: { key: "statusPlanning", color: "gray" },
  ongoing: { key: "statusOngoing", color: "blue" },
  paused: { key: "statusPaused", color: "orange" },
  completed: { key: "statusCompleted", color: "green" },
};

export function TaskStatusBadge({ status }) {
  const { t } = useLang();
  const meta = TASK_MAP[status] || TASK_MAP.pending;
  return <span className={`badge badge-${meta.color}`}>{t(meta.key)}</span>;
}

export function ProjectStatusBadge({ status }) {
  const { t } = useLang();
  const meta = PROJECT_MAP[status] || PROJECT_MAP.planning;
  return <span className={`badge badge-${meta.color}`}>{t(meta.key)}</span>;
}

export function PriorityBadge({ priority }) {
  const { t } = useLang();
  const color = priority === "high" ? "red" : priority === "medium" ? "orange" : "gray";
  return <span className={`badge badge-${color}`}>{t(priority || "low")}</span>;
}
