import React from "react";
import { useData } from "../context/DataContext";
import { useLang } from "../context/LanguageContext";
import { IconLayers } from "./Icons";
import { formatMoney } from "../utils/helpers";

const STATUS_COLOR = { not_started: "gray", in_progress: "orange", completed: "green" };

// Compact list of a project's phases with budget/status — used on the manager
// and client "Progress" pages so the client can see every phase of their work.
export default function PhasesSummary({ projectId, showBudget = true }) {
  const { store } = useData();
  const { t } = useLang();

  const phases = store.phases
    .filter((p) => p.projectId === projectId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (phases.length === 0) return null;

  const materials = store.materials.filter((m) => m.projectId === projectId);
  const payments = store.payments.filter((p) => p.projectId === projectId);

  function spentFor(phaseId) {
    const matSpent = materials.filter((m) => m.phaseId === phaseId).reduce((s, m) => s + Number(m.totalPrice || 0), 0);
    const paySpent = payments.filter((p) => p.phaseId === phaseId).reduce((s, p) => s + Number(p.amount || 0), 0);
    return matSpent + paySpent;
  }

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <div className="section-title">
        <h3 className="flex-gap"><IconLayers style={{ width: 17, height: 17 }} /> {t("phases")}</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {phases.map((p, i) => {
          const spent = spentFor(p.id);
          const budget = Number(p.budget || 0);
          const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
          return (
            <div key={p.id}>
              <div className="flex-between" style={{ marginBottom: 5 }}>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{i + 1}. {p.name}</span>
                <span className={`badge badge-${STATUS_COLOR[p.status] || "gray"}`}>
                  {t(`phaseStatus${p.status === "not_started" ? "NotStarted" : p.status === "in_progress" ? "InProgress" : "Completed"}`)}
                </span>
              </div>
              {showBudget && (
                <>
                  <div className="progress-bar-outer" style={{ height: 6 }}>
                    <div className="progress-bar-inner" style={{ width: `${pct}%`, background: pct > 90 ? "var(--danger)" : "var(--accent)" }} />
                  </div>
                  <div className="text-muted" style={{ fontSize: 11.5, marginTop: 4 }}>
                    {formatMoney(spent)} / {formatMoney(budget)}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
