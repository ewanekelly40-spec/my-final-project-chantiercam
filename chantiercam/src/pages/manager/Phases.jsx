import React, { useMemo, useRef, useState } from "react";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import useActiveProject from "../../utils/useActiveProject";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import {
  IconPlus, IconLayers, IconTrash, IconEdit, IconArrowUp, IconArrowDown,
  IconUpload, IconFileText, IconAlert,
} from "../../components/Icons";
import { uid, formatMoney, isDirty } from "../../utils/helpers";
import { useUnsavedGuard, confirmDiscard } from "../../utils/useUnsavedGuard";
import { SUGGESTED_PHASES } from "../../utils/seed";

const emptyForm = { name: "", budget: "", status: "not_started", notes: "" };

const STATUS_COLOR = { not_started: "gray", in_progress: "orange", completed: "green" };

export default function Phases() {
  const { store, addItem, updateItem, removeItem } = useData();
  const { t } = useLang();
  const { showToast } = useToast();
  const { project, projectId } = useActiveProject();
  const docInputRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [docTargetPhase, setDocTargetPhase] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const phases = store.phases
    .filter((p) => p.projectId === projectId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const materials = store.materials.filter((m) => m.projectId === projectId);
  const payments = store.payments.filter((p) => p.projectId === projectId);

  function spentFor(phaseId) {
    const matSpent = materials.filter((m) => m.phaseId === phaseId).reduce((s, m) => s + Number(m.totalPrice || 0), 0);
    const paySpent = payments.filter((p) => p.phaseId === phaseId).reduce((s, p) => s + Number(p.amount || 0), 0);
    return matSpent + paySpent;
  }

  const totalPhasesBudget = useMemo(() => phases.reduce((s, p) => s + Number(p.budget || 0), 0), [phases]);
  const dirty = isDirty(form, initialForm);
  useUnsavedGuard(modalOpen && dirty);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function openCreate() {
    const f = { ...emptyForm };
    setForm(f);
    setInitialForm(f);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(p) {
    const f = { name: p.name, budget: p.budget, status: p.status, notes: p.notes || "" };
    setForm(f);
    setInitialForm(f);
    setEditingId(p.id);
    setModalOpen(true);
  }

  function requestClose() {
    if (!confirmDiscard(dirty, t)) return;
    setModalOpen(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || form.budget === "") return;

    if (editingId) {
      updateItem("phases", editingId, { name: form.name, budget: Number(form.budget) || 0, status: form.status, notes: form.notes });
      showToast(t("save"));
    } else {
      const nextOrder = phases.length > 0 ? Math.max(...phases.map((p) => p.order || 0)) + 1 : 1;
      addItem("phases", {
        id: uid("phase"),
        projectId,
        name: form.name,
        budget: Number(form.budget) || 0,
        status: form.status,
        notes: form.notes,
        order: nextOrder,
        documents: [],
        createdAt: new Date().toISOString(),
      });
      showToast(t("phaseCreatedGoUsers"));
    }
    setModalOpen(false);
  }

  function handleDelete() {
    removeItem("phases", confirmDelete);
    setConfirmDelete(null);
    showToast(t("delete"));
  }

  function move(phase, dir) {
    const sorted = phases;
    const idx = sorted.findIndex((p) => p.id === phase.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    updateItem("phases", phase.id, { order: other.order });
    updateItem("phases", other.id, { order: phase.order });
  }

  function triggerUploadDoc(phase) {
    setDocTargetPhase(phase);
    setTimeout(() => docInputRef.current?.click(), 0);
  }

  async function handleDocFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !docTargetPhase) return;
    setUploadingDoc(true);
    try {
      const url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const doc = { id: uid("doc"), name: file.name, url, uploadedAt: new Date().toISOString() };
      updateItem("phases", docTargetPhase.id, { documents: [...(docTargetPhase.documents || []), doc] });
      showToast(t("uploadDocument"));
    } finally {
      setUploadingDoc(false);
      setDocTargetPhase(null);
    }
  }

  function removeDoc(phase, docId) {
    updateItem("phases", phase.id, { documents: (phase.documents || []).filter((d) => d.id !== docId) });
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t("phases")}</h1>
          <p>{project?.name} — {t("createPhasesHint")}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <IconPlus style={{ width: 17, height: 17 }} /> {t("newPhase")}
        </button>
      </div>

      {phases.length > 0 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="flex-between" style={{ marginBottom: 10 }}>
            <span className="text-muted" style={{ fontSize: 13 }}>{t("totalPhasesBudget")}</span>
            <strong>{formatMoney(totalPhasesBudget)} <span className="text-muted" style={{ fontWeight: 400 }}>/ {formatMoney(project?.budget)}</span></strong>
          </div>
          <div className="progress-bar-outer">
            <div
              className="progress-bar-inner"
              style={{
                width: `${project?.budget ? Math.min(100, Math.round((totalPhasesBudget / project.budget) * 100)) : 0}%`,
                background: totalPhasesBudget > Number(project?.budget || 0) ? "var(--danger)" : "var(--accent)",
              }}
            />
          </div>
          {totalPhasesBudget > Number(project?.budget || 0) && (
            <div className="flex-gap" style={{ marginTop: 10, color: "var(--danger)", fontSize: 13 }}>
              <IconAlert style={{ width: 15, height: 15 }} /> {t("phaseBudgetExceeds")}
            </div>
          )}
        </div>
      )}

      {phases.length === 0 ? (
        <div className="card empty-state">
          <IconLayers />
          <h4>{t("noPhasesYet")}</h4>
          <p>{t("createPhasesHint")}</p>
          <div style={{ height: 16 }} />
          <button className="btn btn-primary" onClick={openCreate}>
            <IconPlus style={{ width: 17, height: 17 }} /> {t("newPhase")}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {phases.map((p, i) => {
            const spent = spentFor(p.id);
            const budget = Number(p.budget || 0);
            const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
            return (
              <div className="task-card" key={p.id}>
                <div className="top">
                  <div>
                    <h4>{i + 1}. {p.name}</h4>
                    <div className="flex-gap"><span className={`badge badge-${STATUS_COLOR[p.status] || "gray"}`}>{t(`phaseStatus${p.status === "not_started" ? "NotStarted" : p.status === "in_progress" ? "InProgress" : "Completed"}`)}</span></div>
                  </div>
                  <div className="flex-gap">
                    <button className="btn btn-ghost btn-icon" disabled={i === 0} onClick={() => move(p, -1)} title={t("reorderUp")}>
                      <IconArrowUp style={{ width: 15, height: 15 }} />
                    </button>
                    <button className="btn btn-ghost btn-icon" disabled={i === phases.length - 1} onClick={() => move(p, 1)} title={t("reorderDown")}>
                      <IconArrowDown style={{ width: 15, height: 15 }} />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => openEdit(p)}>
                      <IconEdit style={{ width: 15, height: 15 }} />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => setConfirmDelete(p.id)}>
                      <IconTrash style={{ width: 15, height: 15, color: "var(--danger)" }} />
                    </button>
                  </div>
                </div>
                {p.notes && <p className="desc">{p.notes}</p>}

                <div style={{ marginTop: 12 }}>
                  <div className="flex-between" style={{ fontSize: 12.5, marginBottom: 6 }}>
                    <span className="text-muted">{t("phaseSpent")}: <strong style={{ color: "var(--ink)" }}>{formatMoney(spent)}</strong></span>
                    <span className="text-muted">{t("phaseBudget")}: <strong style={{ color: "var(--ink)" }}>{formatMoney(budget)}</strong></span>
                  </div>
                  <div className="progress-bar-outer">
                    <div className="progress-bar-inner" style={{ width: `${pct}%`, background: pct > 90 ? "var(--danger)" : "var(--accent)" }} />
                  </div>
                  <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
                    {t("phaseRemaining")}: {formatMoney(budget - spent)}
                  </div>
                </div>

                <div style={{ marginTop: 14, borderTop: "1px solid var(--border-soft)", paddingTop: 12 }}>
                  <div className="flex-between" style={{ marginBottom: 8 }}>
                    <strong style={{ fontSize: 12.5 }}>{t("documents")}</strong>
                    <button className="btn btn-outline btn-sm" disabled={uploadingDoc} onClick={() => triggerUploadDoc(p)}>
                      <IconUpload style={{ width: 13, height: 13 }} /> {t("uploadDocument")}
                    </button>
                  </div>
                  {(p.documents || []).length === 0 ? (
                    <div className="text-muted" style={{ fontSize: 12.5 }}>{t("noDocuments")}</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {p.documents.map((d) => (
                        <div key={d.id} className="card-flat flex-between" style={{ padding: "8px 12px" }}>
                          <a href={d.url} download={d.name} className="flex-gap" style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                            <IconFileText style={{ width: 15, height: 15 }} /> {d.name}
                          </a>
                          <button className="btn btn-ghost btn-icon" onClick={() => removeDoc(p, d.id)}>
                            <IconTrash style={{ width: 13, height: 13, color: "var(--danger)" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <input ref={docInputRef} type="file" hidden onChange={handleDocFile} />

      <Modal
        open={modalOpen}
        onClose={requestClose}
        title={editingId ? t("edit") : t("newPhase")}
        footer={
          <>
            <button className="btn btn-outline" onClick={requestClose}>{t("cancel")}</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{editingId ? t("save") : t("create")}</button>
          </>
        }
      >
        <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: "block" }}>{t("suggestedPhases")}</label>
        <div className="chip-row">
          {SUGGESTED_PHASES.map((s) => (
            <span key={s} className="sugg-chip" onClick={() => set("name", s)}>{s}</span>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{t("phaseName")}</label>
            <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Fondation" />
          </div>
          <div className="row-2">
            <div className="field">
              <label>{t("phaseBudget")} (XAF)</label>
              <input className="input" type="number" min="0" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="15000000" />
            </div>
            <div className="field">
              <label>{t("status")}</label>
              <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="not_started">{t("phaseStatusNotStarted")}</option>
                <option value="in_progress">{t("phaseStatusInProgress")}</option>
                <option value="completed">{t("phaseStatusCompleted")}</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>{t("phaseNotes")}</label>
            <textarea className="input" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
