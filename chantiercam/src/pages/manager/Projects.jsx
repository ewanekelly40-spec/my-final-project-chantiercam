import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { ProjectStatusBadge } from "../../components/StatusBadge";
import { IconPlus, IconBuilding, IconMapPin, IconTrash, IconEdit, IconLayers } from "../../components/Icons";
import { uid, formatMoney, formatDate, isDirty } from "../../utils/helpers";
import { useUnsavedGuard, confirmDiscard } from "../../utils/useUnsavedGuard";

const emptyForm = { name: "", location: "", description: "", budget: "", startDate: "", endDate: "", status: "planning" };

export default function Projects() {
  const { currentUser, activeProjectId, setActiveProjectId } = useAuth();
  const { store, addItem, updateItem, removeItem } = useData();
  const { t } = useLang();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const dirty = isDirty(form, initialForm);
  useUnsavedGuard(modalOpen && dirty);

  const myProjects = store.projects
    .filter((p) => p.managerId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  function openCreate() {
    setForm(emptyForm);
    setInitialForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(p) {
    const f = { name: p.name, location: p.location, description: p.description, budget: p.budget, startDate: p.startDate, endDate: p.endDate, status: p.status };
    setForm(f);
    setInitialForm(f);
    setEditingId(p.id);
    setModalOpen(true);
  }

  function requestClose() {
    if (!confirmDiscard(dirty, t)) return;
    setModalOpen(false);
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.location) return;

    if (editingId) {
      updateItem("projects", editingId, { ...form, budget: Number(form.budget) || 0 });
      showToast("Project updated.");
      setModalOpen(false);
    } else {
      const id = uid("proj");
      addItem("projects", {
        id,
        managerId: currentUser.id,
        ...form,
        budget: Number(form.budget) || 0,
        createdAt: new Date().toISOString(),
        cover: null,
      });
      setActiveProjectId(id);
      setModalOpen(false);
      showToast(t("projectCreatedNextStep"));
      navigate("/manager/phases");
      return;
    }
  }

  function handleDelete() {
    removeItem("projects", confirmDelete);
    if (activeProjectId === confirmDelete) {
      const remaining = myProjects.filter((p) => p.id !== confirmDelete);
      setActiveProjectId(remaining[0]?.id || null);
    }
    setConfirmDelete(null);
    showToast("Project deleted.");
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t("projects")}</h1>
          <p>{t("createFirstProject")}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <IconPlus style={{ width: 17, height: 17 }} /> {t("newProject")}
        </button>
      </div>

      {myProjects.length === 0 ? (
        <div className="card empty-state">
          <IconBuilding />
          <h4>{t("noProjectsYet")}</h4>
          <p>{t("createFirstProject")}</p>
          <div style={{ height: 16 }} />
          <button className="btn btn-primary" onClick={openCreate}>
            <IconPlus style={{ width: 17, height: 17 }} /> {t("newProject")}
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {myProjects.map((p) => {
            const phases = store.phases.filter((ph) => ph.projectId === p.id).sort((a, b) => (a.order || 0) - (b.order || 0));
            const completedPhases = phases.filter((ph) => ph.status === "completed").length;
            const phasePct = phases.length > 0 ? Math.round((completedPhases / phases.length) * 100) : 0;
            return (
              <div
                key={p.id}
                className="project-card"
                style={p.id === activeProjectId ? { borderColor: "var(--accent)", boxShadow: "0 0 0 3px var(--accent-soft)" } : undefined}
                onClick={() => { setActiveProjectId(p.id); showToast(`Switched to ${p.name}`); }}
              >
                <div className="cover"><IconBuilding /></div>
                <div className="body">
                  <h4>{p.name}</h4>
                  <div className="loc"><IconMapPin style={{ width: 13, height: 13 }} /> {p.location}</div>
                  <ProjectStatusBadge status={p.status} />

                  {phases.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div className="flex-between" style={{ fontSize: 11.5, marginBottom: 5 }}>
                        <span className="text-muted flex-gap"><IconLayers style={{ width: 12, height: 12 }} /> {phases.length} {t("phases").toLowerCase()}</span>
                        <span className="text-muted">{phasePct}%</span>
                      </div>
                      <div className="progress-bar-outer" style={{ height: 6 }}>
                        <div className="progress-bar-inner" style={{ width: `${phasePct}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="foot">
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{formatMoney(p.budget)}</span>
                    <div className="flex-gap">
                      <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(p); }}>
                        <IconEdit style={{ width: 15, height: 15 }} />
                      </button>
                      <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); setConfirmDelete(p.id); }}>
                        <IconTrash style={{ width: 15, height: 15, color: "var(--danger)" }} />
                      </button>
                    </div>
                  </div>
                  <div className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
                    {formatDate(p.startDate)} → {formatDate(p.endDate)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={requestClose}
        title={editingId ? t("edit") : t("newProject")}
        footer={
          <>
            <button className="btn btn-outline" onClick={requestClose}>{t("cancel")}</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{editingId ? t("save") : t("create")}</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{t("projectName")}</label>
            <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Résidence Les Palmiers" />
          </div>
          <div className="field">
            <label>{t("projectLocation")}</label>
            <input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Bastos, Yaoundé" />
          </div>
          <div className="field">
            <label>{t("projectDescription")}</label>
            <textarea className="input" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Scope of works, number of units, notes…" />
          </div>
          <div className="row-2">
            <div className="field">
              <label>{t("projectBudget")} (XAF)</label>
              <input className="input" type="number" min="0" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="85000000" />
            </div>
            <div className="field">
              <label>{t("status")}</label>
              <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="planning">{t("statusPlanning")}</option>
                <option value="ongoing">{t("statusOngoing")}</option>
                <option value="paused">{t("statusPaused")}</option>
                <option value="completed">{t("statusCompleted")}</option>
              </select>
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>{t("startDate")}</label>
              <input className="input" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </div>
            <div className="field">
              <label>{t("endDate")}</label>
              <input className="input" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        message="Deleting this project will not remove its historical records. This action cannot be undone."
      />
    </div>
  );
}
