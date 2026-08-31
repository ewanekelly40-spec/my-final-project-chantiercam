import React from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import useActiveProject from "../../utils/useActiveProject";
import { TaskStatusBadge } from "../../components/StatusBadge";
import { IconCheckSquare, IconUsers, IconDollar, IconPackage, IconBuilding, IconArrowRight } from "../../components/Icons";
import { formatMoney, formatDate, initials } from "../../utils/helpers";

export default function Overview() {
  const { currentUser } = useAuth();
  const { store } = useData();
  const { t } = useLang();
  const { project, projectId } = useActiveProject();

  const myProjects = store.projects.filter((p) => p.managerId === currentUser.id);
  if (myProjects.length === 0) return <Navigate to="/manager/projects" replace />;
  if (!project) return <Navigate to="/manager/projects" replace />;

  const tasks = store.tasks.filter((t2) => t2.projectId === projectId);
  const users = store.projectUsers.filter((u) => u.projectId === projectId);
  const workers = users.filter((u) => u.role === "worker");
  const clients = users.filter((u) => u.role === "client");
  const materials = store.materials.filter((m) => m.projectId === projectId);
  const payments = store.payments.filter((p) => p.projectId === projectId);

  const spentMaterials = materials.reduce((s, m) => s + Number(m.totalPrice || 0), 0);
  const spentPayments = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalSpent = spentMaterials + spentPayments;
  const budget = Number(project.budget || 0);
  const pct = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;

  const activeTasks = tasks.filter((t2) => !["completed", "refused"].includes(t2.status)).length;
  const completedTasks = tasks.filter((t2) => t2.status === "completed").length;

  const recentTasks = [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t("hello")}, {currentUser.name.split(" ")[0]} 👋</h1>
          <p>{project.name} — {project.location}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon"><IconCheckSquare /></div>
          <div className="value">{activeTasks}</div>
          <div className="label">{t("activeTasks")}</div>
        </div>
        <div className="stat-card">
          <div className="icon"><IconUsers /></div>
          <div className="value">{workers.length + clients.length}</div>
          <div className="label">{t("users")}</div>
        </div>
        <div className="stat-card">
          <div className="icon"><IconPackage /></div>
          <div className="value">{materials.length}</div>
          <div className="label">{t("materials")}</div>
        </div>
        <div className="stat-card">
          <div className="icon"><IconDollar /></div>
          <div className="value">{formatMoney(totalSpent)}</div>
          <div className="label">{t("totalSpent")}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">
            <h3>{t("tasks")}</h3>
            <Link to="/manager/tasks" className="btn btn-ghost btn-sm">{t("tasks")} <IconArrowRight style={{ width: 14, height: 14 }} /></Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state"><IconCheckSquare /><p>{t("noTasks")}</p></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentTasks.map((tk) => {
                const assignee = users.find((u) => u.id === tk.assignedTo);
                return (
                  <div key={tk.id} className="card-flat flex-between">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{tk.title}</div>
                      <div className="text-muted" style={{ fontSize: 12.5, marginTop: 3 }}>{assignee?.name} · {formatDate(tk.dueDate)}</div>
                    </div>
                    <TaskStatusBadge status={tk.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title"><h3>{t("finances")}</h3></div>
          <div style={{ marginBottom: 8 }}>
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <span className="text-muted" style={{ fontSize: 13 }}>{t("totalBudget")}</span>
              <strong>{formatMoney(budget)}</strong>
            </div>
            <div className="progress-bar-outer">
              <div className="progress-bar-inner" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex-between" style={{ marginTop: 8 }}>
              <span className="text-muted" style={{ fontSize: 12.5 }}>{pct}% {t("totalSpent").toLowerCase()}</span>
              <span className="text-muted" style={{ fontSize: 12.5 }}>{formatMoney(budget - totalSpent)} {t("remainingBudget").toLowerCase()}</span>
            </div>
          </div>
          <div className="spacer-16" />
          <div className="flex-between" style={{ padding: "8px 0", borderTop: "1px solid var(--border-soft)" }}>
            <span className="text-muted" style={{ fontSize: 13 }}>{t("materialsCost")}</span>
            <strong style={{ fontSize: 13.5 }}>{formatMoney(spentMaterials)}</strong>
          </div>
          <div className="flex-between" style={{ padding: "8px 0", borderTop: "1px solid var(--border-soft)" }}>
            <span className="text-muted" style={{ fontSize: 13 }}>{t("laborCost")}</span>
            <strong style={{ fontSize: 13.5 }}>{formatMoney(spentPayments)}</strong>
          </div>
          <Link to="/manager/finances" className="btn btn-outline btn-block" style={{ marginTop: 14 }}>{t("finances")}</Link>
        </div>
      </div>
    </div>
  );
}
