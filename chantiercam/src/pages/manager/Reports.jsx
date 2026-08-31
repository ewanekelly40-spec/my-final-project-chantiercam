import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import useActiveProject from "../../utils/useActiveProject";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import {
  IconFileText, IconDollar, IconPackage, IconCreditCard, IconLayers, IconCamera, IconCheckSquare,
  IconPrinter, IconUpload as IconExport, IconEdit, IconTrash,
} from "../../components/Icons";
import { uid, formatMoney, formatDate, timeAgo, exportCsv, openReportWindow, isDirty } from "../../utils/helpers";
import { useUnsavedGuard, confirmDiscard } from "../../utils/useUnsavedGuard";

export default function Reports() {
  const { store, addItem, updateItem, removeItem } = useData();
  const { t } = useLang();
  const { showToast } = useToast();
  const { project, projectId } = useActiveProject();

  const [editingReport, setEditingReport] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", note: "" });
  const [initialEditForm, setInitialEditForm] = useState({ title: "", note: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const editDirty = isDirty(editForm, initialEditForm);
  useUnsavedGuard(!!editingReport && editDirty);

  const phases = store.phases.filter((p) => p.projectId === projectId).sort((a, b) => (a.order || 0) - (b.order || 0));
  const materials = store.materials.filter((m) => m.projectId === projectId);
  const payments = store.payments.filter((p) => p.projectId === projectId);
  const users = store.projectUsers.filter((u) => u.projectId === projectId);
  const progress = store.progress.filter((p) => p.projectId === projectId).sort((a, b) => new Date(b.date) - new Date(a.date));
  const tasks = store.tasks.filter((tk) => tk.projectId === projectId);
  const savedReports = store.reports
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const spentMaterials = materials.reduce((s, m) => s + Number(m.totalPrice || 0), 0);
  const spentPayments = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalSpent = spentMaterials + spentPayments;
  const budget = Number(project?.budget || 0);
  const remaining = budget - totalSpent;

  function phaseName(id) {
    return phases.find((p) => p.id === id)?.name || "—";
  }

  function spentForPhase(phaseId) {
    const matSpent = materials.filter((m) => m.phaseId === phaseId).reduce((s, m) => s + Number(m.totalPrice || 0), 0);
    const paySpent = payments.filter((p) => p.phaseId === phaseId).reduce((s, p) => s + Number(p.amount || 0), 0);
    return matSpent + paySpent;
  }

  function statusLabel(s) {
    return t(`phaseStatus${s === "not_started" ? "NotStarted" : s === "in_progress" ? "InProgress" : "Completed"}`);
  }

  function taskStatusLabel(s) {
    return t(`taskStatus${s.charAt(0).toUpperCase()}${s.slice(1).replace(/_([a-z])/g, (m, c) => c.toUpperCase())}`);
  }

  function header() {
    return `
      <h1>${project?.name || ""}</h1>
      <div class="muted">${project?.location || ""} — ${t("generatedOn")} ${formatDate(new Date().toISOString())}</div>
    `;
  }

  function phasesTable() {
    if (phases.length === 0) return "";
    return `
      <h2>${t("phases")}</h2>
      <table>
        <thead><tr><th>${t("phaseName")}</th><th>${t("status")}</th><th class="right">${t("phaseBudget")}</th><th class="right">${t("phaseSpent")}</th><th class="right">${t("phaseRemaining")}</th></tr></thead>
        <tbody>
          ${phases.map((p) => {
            const spent = spentForPhase(p.id);
            const b = Number(p.budget || 0);
            return `<tr><td>${p.name}</td><td>${statusLabel(p.status)}</td><td class="right">${formatMoney(b)}</td><td class="right">${formatMoney(spent)}</td><td class="right">${formatMoney(b - spent)}</td></tr>`;
          }).join("")}
        </tbody>
      </table>
    `;
  }

  function financeKpis() {
    return `
      <div class="kpis">
        <div class="kpi"><div class="v">${formatMoney(budget)}</div><div class="l">${t("totalBudget")}</div></div>
        <div class="kpi"><div class="v">${formatMoney(totalSpent)}</div><div class="l">${t("totalSpent")}</div></div>
        <div class="kpi"><div class="v">${formatMoney(spentMaterials)}</div><div class="l">${t("materialsCost")}</div></div>
        <div class="kpi"><div class="v">${formatMoney(spentPayments)}</div><div class="l">${t("laborCost")}</div></div>
        <div class="kpi"><div class="v" style="color:${remaining < 0 ? "#d64545" : "#1f9d55"}">${formatMoney(remaining)}</div><div class="l">${t("remainingBudget")}</div></div>
      </div>
    `;
  }

  function materialsTable() {
    if (materials.length === 0) return `<p class="muted">${t("noMaterials")}</p>`;
    return `
      <table>
        <thead><tr><th>${t("materialName")}</th><th>${t("phase")}</th><th>${t("quantity")}</th><th class="right">${t("totalPrice")}</th><th>${t("purchaseDate")}</th></tr></thead>
        <tbody>
          ${materials.map((m) => `<tr><td>${m.name}</td><td>${phaseName(m.phaseId)}</td><td>${m.quantity} ${m.unit}</td><td class="right">${formatMoney(m.totalPrice)}</td><td>${formatDate(m.purchaseDate)}</td></tr>`).join("")}
        </tbody>
      </table>
    `;
  }

  function paymentsTable() {
    if (payments.length === 0) return `<p class="muted">${t("noPayments")}</p>`;
    return `
      <table>
        <thead><tr><th>${t("paymentTo")}</th><th>${t("phase")}</th><th class="right">${t("amount")}</th><th>${t("paymentType")}</th><th>${t("paymentPeriod")}</th><th>${t("paymentDate")}</th></tr></thead>
        <tbody>
          ${payments.map((p) => {
            const u = users.find((x) => x.id === p.userId);
            return `<tr><td>${u?.name || "—"}</td><td>${phaseName(p.phaseId)}</td><td class="right">${formatMoney(p.amount)}</td><td>${p.type}</td><td>${p.period || ""}</td><td>${formatDate(p.date)}</td></tr>`;
          }).join("")}
        </tbody>
      </table>
    `;
  }

  function progressList() {
    if (progress.length === 0) return `<p class="muted">${t("noUpdates")}</p>`;
    return `
      <table>
        <thead><tr><th>${t("paymentDate")}</th><th>${t("phase")}</th><th>${t("updateTitle")}</th><th>${t("notes")}</th></tr></thead>
        <tbody>
          ${progress.map((u) => `<tr><td>${formatDate(u.date)}</td><td>${u.phase || phaseName(u.phaseId)}</td><td>${u.title}</td><td>${u.note || ""}</td></tr>`).join("")}
        </tbody>
      </table>
    `;
  }

  function tasksTable() {
    if (tasks.length === 0) return `<p class="muted">${t("noTasks")}</p>`;
    return `
      <table>
        <thead><tr><th>${t("taskTitle")}</th><th>${t("phase")}</th><th>${t("assignTo")}</th><th>${t("status")}</th><th>${t("priority")}</th><th>${t("dueDate")}</th></tr></thead>
        <tbody>
          ${tasks.map((tk) => {
            const w = users.find((u) => u.id === tk.assignedTo);
            return `<tr><td>${tk.title}</td><td>${phaseName(tk.phaseId)}</td><td>${w?.name || "—"}</td><td>${taskStatusLabel(tk.status)}</td><td>${tk.priority}</td><td>${formatDate(tk.dueDate)}</td></tr>`;
          }).join("")}
        </tbody>
      </table>
    `;
  }

  function bodyFor(type) {
    switch (type) {
      case "financial": return `${header()}<h2>${t("financialReport")}</h2>${financeKpis()}${phasesTable()}`;
      case "phases": return `${header()}${phasesTable()}`;
      case "materials": return `${header()}<h2>${t("materialsReport")}</h2>${materialsTable()}`;
      case "payments": return `${header()}<h2>${t("paymentsReport")}</h2>${paymentsTable()}`;
      case "progress": return `${header()}<h2>${t("progressReport")}</h2>${progressList()}`;
      case "tasks": return `${header()}<h2>${t("tasksReport")}</h2>${tasksTable()}`;
      case "full": return `
        ${header()}
        <h2>${t("financialReport")}</h2>${financeKpis()}
        ${phasesTable()}
        <h2>${t("materialsReport")}</h2>${materialsTable()}
        <h2>${t("paymentsReport")}</h2>${paymentsTable()}
        <h2>${t("tasksReport")}</h2>${tasksTable()}
        <h2>${t("progressReport")}</h2>${progressList()}
      `;
      default: return header();
    }
  }

  const TYPE_TITLE = {
    financial: "financialReport", phases: "phasesReport", materials: "materialsReport",
    payments: "paymentsReport", progress: "progressReport", tasks: "tasksReport", full: "fullReport",
  };

  function saveReportRecord(type) {
    addItem("reports", {
      id: uid("report"),
      projectId,
      type,
      title: `${t(TYPE_TITLE[type])} — ${formatDate(new Date().toISOString())}`,
      note: "",
      createdAt: new Date().toISOString(),
    });
  }

  function generate(type) {
    openReportWindow(t(TYPE_TITLE[type]), bodyFor(type));
    saveReportRecord(type);
    showToast(t("reportSaved"));
  }

  function reopenReport(r) {
    openReportWindow(r.title, bodyFor(r.type));
  }

  function openEditReport(r) {
    const f = { title: r.title, note: r.note || "" };
    setEditForm(f);
    setInitialEditForm(f);
    setEditingReport(r);
  }

  function requestCloseEdit() {
    if (!confirmDiscard(editDirty, t)) return;
    setEditingReport(null);
  }

  function saveEditReport(e) {
    e.preventDefault();
    updateItem("reports", editingReport.id, { title: editForm.title, note: editForm.note });
    setEditingReport(null);
    showToast(t("save"));
  }

  function handleDeleteReport() {
    removeItem("reports", confirmDelete);
    setConfirmDelete(null);
    showToast(t("delete"));
  }

  function exportMaterialsCsv() {
    exportCsv(`materials-${project?.name}`, [t("materialName"), t("phase"), t("quantity"), t("totalPrice"), t("purchaseDate")],
      materials.map((m) => [m.name, phaseName(m.phaseId), `${m.quantity} ${m.unit}`, m.totalPrice, m.purchaseDate]));
    saveReportRecord("materials");
  }
  function exportPaymentsCsv() {
    exportCsv(`payments-${project?.name}`, [t("paymentTo"), t("phase"), t("amount"), t("paymentType"), t("paymentPeriod"), t("paymentDate")],
      payments.map((p) => {
        const u = users.find((x) => x.id === p.userId);
        return [u?.name || "", phaseName(p.phaseId), p.amount, p.type, p.period || "", p.date];
      }));
    saveReportRecord("payments");
  }
  function exportPhasesCsv() {
    exportCsv(`phases-${project?.name}`, [t("phaseName"), t("status"), t("phaseBudget"), t("phaseSpent"), t("phaseRemaining")],
      phases.map((p) => {
        const spent = spentForPhase(p.id);
        return [p.name, statusLabel(p.status), p.budget, spent, Number(p.budget || 0) - spent];
      }));
    saveReportRecord("phases");
  }
  function exportTasksCsv() {
    exportCsv(`tasks-${project?.name}`, [t("taskTitle"), t("phase"), t("assignTo"), t("status"), t("priority"), t("dueDate")],
      tasks.map((tk) => {
        const w = users.find((u) => u.id === tk.assignedTo);
        return [tk.title, phaseName(tk.phaseId), w?.name || "", taskStatusLabel(tk.status), tk.priority, tk.dueDate];
      }));
    saveReportRecord("tasks");
  }

  const cards = [
    { key: "financial", title: t("financialReport"), desc: t("financialReportDesc"), icon: IconDollar, onPdf: () => generate("financial") },
    { key: "phases", title: t("phasesReport"), desc: t("phasesReportDesc"), icon: IconLayers, onPdf: () => generate("phases"), onCsv: phases.length ? exportPhasesCsv : null },
    { key: "materials", title: t("materialsReport"), desc: t("materialsReportDesc"), icon: IconPackage, onPdf: () => generate("materials"), onCsv: materials.length ? exportMaterialsCsv : null },
    { key: "payments", title: t("paymentsReport"), desc: t("paymentsReportDesc"), icon: IconCreditCard, onPdf: () => generate("payments"), onCsv: payments.length ? exportPaymentsCsv : null },
    { key: "tasks", title: t("tasksReport"), desc: t("tasksReportDesc"), icon: IconCheckSquare, onPdf: () => generate("tasks"), onCsv: tasks.length ? exportTasksCsv : null },
    { key: "progress", title: t("progressReport"), desc: t("progressReportDesc"), icon: IconCamera, onPdf: () => generate("progress") },
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t("reports")}</h1>
          <p>{project?.name}</p>
        </div>
        <button className="btn btn-primary" onClick={() => generate("full")}>
          <IconFileText style={{ width: 17, height: 17 }} /> {t("fullReport")}
        </button>
      </div>

      <div className="cards-grid">
        {cards.map((c) => (
          <div className="card" key={c.key}>
            <div className="flex-gap" style={{ marginBottom: 10 }}>
              <c.icon style={{ width: 20, height: 20, color: "var(--accent)" }} />
              <h4 style={{ fontSize: 15.5 }}>{c.title}</h4>
            </div>
            <p className="text-muted" style={{ fontSize: 13, minHeight: 36 }}>{c.desc}</p>
            <div className="flex-gap" style={{ marginTop: 12 }}>
              <button className="btn btn-outline btn-sm" onClick={c.onPdf}>
                <IconPrinter style={{ width: 13, height: 13 }} /> {t("exportPdf")}
              </button>
              {c.onCsv && (
                <button className="btn btn-outline btn-sm" onClick={c.onCsv}>
                  <IconExport style={{ width: 13, height: 13, transform: "rotate(180deg)" }} /> {t("exportCsv")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title"><h3>{t("savedReports")}</h3></div>
        {savedReports.length === 0 ? (
          <div className="empty-state"><IconFileText /><p>{t("noSavedReports")}</p></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>{t("title")}</th><th>{t("category")}</th><th>{t("notes")}</th><th>{t("generatedOn")}</th><th></th></tr>
              </thead>
              <tbody>
                {savedReports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.title}</td>
                    <td><span className="badge badge-blue">{t(TYPE_TITLE[r.type] || r.type)}</span></td>
                    <td className="text-muted">{r.note || "—"}</td>
                    <td className="text-muted">{timeAgo(r.createdAt)}</td>
                    <td>
                      <div className="flex-gap">
                        <button className="btn btn-ghost btn-icon" title={t("exportPdf")} onClick={() => reopenReport(r)}>
                          <IconPrinter style={{ width: 15, height: 15 }} />
                        </button>
                        <button className="btn btn-ghost btn-icon" title={t("edit")} onClick={() => openEditReport(r)}>
                          <IconEdit style={{ width: 15, height: 15 }} />
                        </button>
                        <button className="btn btn-ghost btn-icon" onClick={() => setConfirmDelete(r.id)}>
                          <IconTrash style={{ width: 15, height: 15, color: "var(--danger)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={!!editingReport}
        onClose={requestCloseEdit}
        title={t("editReport")}
        footer={
          <>
            <button className="btn btn-outline" onClick={requestCloseEdit}>{t("cancel")}</button>
            <button className="btn btn-primary" onClick={saveEditReport}>{t("save")}</button>
          </>
        }
      >
        <form onSubmit={saveEditReport}>
          <div className="field">
            <label>{t("title")}</label>
            <input className="input" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="field">
            <label>{t("notes")}</label>
            <textarea className="input" value={editForm.note} onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDeleteReport} />
    </div>
  );
}
