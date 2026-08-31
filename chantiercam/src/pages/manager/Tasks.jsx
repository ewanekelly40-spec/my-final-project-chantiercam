import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import useActiveProject from "../../utils/useActiveProject";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import MediaLightbox from "../../components/MediaLightbox";
import { TaskStatusBadge, PriorityBadge } from "../../components/StatusBadge";
import { IconPlus, IconCheckSquare, IconCalendar, IconUser, IconTrash, IconCheck, IconXCircle, IconEdit } from "../../components/Icons";
import { uid, formatDate, timeAgo, isDirty } from "../../utils/helpers";
import { useUnsavedGuard, confirmDiscard } from "../../utils/useUnsavedGuard";

const emptyForm = { title: "", description: "", assignedTo: "", phaseId: "", priority: "medium", dueDate: "" };
const FILTERS = ["all", "pending", "accepted", "in_progress", "submitted", "completed"];

export default function Tasks() {
  const { store, addItem, updateItem, removeItem } = useData();
  const { t } = useLang();
  const { showToast } = useToast();
  const { project, projectId } = useActiveProject();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [reviewTask, setReviewTask] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [historyTask, setHistoryTask] = useState(null);

  const dirty = isDirty(form, initialForm);
  useUnsavedGuard(modalOpen && dirty);

  const workers = store.projectUsers.filter((u) => u.projectId === projectId && u.role === "worker");
  const phases = store.phases.filter((p) => p.projectId === projectId).sort((a, b) => (a.order || 0) - (b.order || 0));
  const tasks = store.tasks
    .filter((tk) => tk.projectId === projectId)
    .filter((tk) => filter === "all" || tk.status === filter)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  function phaseName(id) {
    return phases.find((p) => p.id === id)?.name;
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function openCreate() {
    setForm(emptyForm);
    setInitialForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(tk) {
    const f = { title: tk.title, description: tk.description, assignedTo: tk.assignedTo, phaseId: tk.phaseId || "", priority: tk.priority, dueDate: tk.dueDate };
    setForm(f);
    setInitialForm(f);
    setEditingId(tk.id);
    setModalOpen(true);
  }

  function requestClose() {
    if (!confirmDiscard(dirty, t)) return;
    setModalOpen(false);
  }

  function pushHistory(tk, action) {
    return [...(tk.history || []), { action, at: new Date().toISOString() }];
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.assignedTo) return;

    if (editingId) {
      const prevTask = store.tasks.find((tk) => tk.id === editingId);
      updateItem("tasks", editingId, {
        ...form,
        updatedAt: new Date().toISOString(),
        history: pushHistory(prevTask, "edited"),
        reminderSent: prevTask.dueDate !== form.dueDate ? false : prevTask.reminderSent,
      });
      if (prevTask && prevTask.assignedTo !== form.assignedTo) {
        addItem("notifications", {
          id: uid("notif"), projectId, userId: form.assignedTo,
          title: "Task assigned to you", message: `You were assigned: ${form.title}`,
          read: false, createdAt: new Date().toISOString(),
        });
      } else {
        addItem("notifications", {
          id: uid("notif"), projectId, userId: form.assignedTo,
          title: "Task updated", message: `"${form.title}" was updated by the site manager.`,
          read: false, createdAt: new Date().toISOString(),
        });
      }
      showToast(t("edit"));
    } else {
      const id = uid("task");
      addItem("tasks", {
        id,
        projectId,
        ...form,
        status: "pending",
        proposal: "",
        proof: [],
        history: [{ action: "created", at: new Date().toISOString() }],
        reminderSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      addItem("notifications", {
        id: uid("notif"), projectId, userId: form.assignedTo,
        title: "New task assigned", message: `You were assigned: ${form.title}`,
        read: false, createdAt: new Date().toISOString(),
      });
      showToast(t("createTask"));
    }
    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  function validateTask(tk, ok) {
    updateItem("tasks", tk.id, {
      status: ok ? "completed" : "in_progress",
      updatedAt: new Date().toISOString(),
      history: pushHistory(tk, ok ? "validated" : "changes_requested"),
    });
    addItem("notifications", {
      id: uid("notif"),
      projectId,
      userId: tk.assignedTo,
      title: ok ? "Work validated" : "Changes requested",
      message: ok ? `Your work on "${tk.title}" was validated.` : `Please review and resubmit "${tk.title}".`,
      read: false,
      createdAt: new Date().toISOString(),
    });
    showToast(ok ? "Task validated." : "Changes requested.");
    setReviewTask(null);
  }

  function handleDelete() {
    removeItem("tasks", confirmDelete);
    setConfirmDelete(null);
    showToast("Task deleted.");
  }

  const HIST_LABEL = {
    created: "Task created", edited: "Task edited", accepted: "Accepted by worker", refused: "Refused by worker",
    submitted: "Submitted for review", validated: "Validated by manager", changes_requested: "Changes requested",
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t("tasks")}</h1>
          <p>{project?.name}</p>
        </div>
        <button className="btn btn-primary" disabled={workers.length === 0} onClick={openCreate}>
          <IconPlus style={{ width: 17, height: 17 }} /> {t("createTask")}
        </button>
      </div>

      <div className="tabs-row">
        {FILTERS.map((f) => (
          <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : t(`taskStatus${f.charAt(0).toUpperCase()}${f.slice(1).replace(/_([a-z])/g, (m,c)=>c.toUpperCase())}`)}
          </button>
        ))}
      </div>

      {workers.length === 0 && (
        <div className="demo-note" style={{ marginBottom: 16 }}>Create a worker account first (Users page) before assigning tasks.</div>
      )}

      {tasks.length === 0 ? (
        <div className="card empty-state"><IconCheckSquare /><h4>{t("noTasks")}</h4></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tasks.map((tk) => {
            const worker = store.projectUsers.find((u) => u.id === tk.assignedTo);
            return (
              <div className="task-card" key={tk.id}>
                <div className="top">
                  <div>
                    <h4>{tk.title}</h4>
                    <div className="flex-gap">
                      <PriorityBadge priority={tk.priority} />
                      <TaskStatusBadge status={tk.status} />
                      {phaseName(tk.phaseId) && <span className="badge badge-blue">{phaseName(tk.phaseId)}</span>}
                    </div>
                  </div>
                  <div className="flex-gap">
                    <button className="btn btn-ghost btn-icon" title="History" onClick={() => setHistoryTask(tk)}>
                      <IconCalendar style={{ width: 15, height: 15 }} />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => openEdit(tk)}>
                      <IconEdit style={{ width: 15, height: 15 }} />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => setConfirmDelete(tk.id)}>
                      <IconTrash style={{ width: 15, height: 15, color: "var(--danger)" }} />
                    </button>
                  </div>
                </div>
                <p className="desc">{tk.description}</p>
                <div className="meta-row">
                  <span><IconUser style={{ width: 13, height: 13 }} /> {worker?.name || "—"}</span>
                  <span><IconCalendar style={{ width: 13, height: 13 }} /> {formatDate(tk.dueDate)}</span>
                </div>
                {tk.proposal && (
                  <div className="card-flat" style={{ marginTop: 10 }}>
                    <strong style={{ fontSize: 12.5 }}>{t("proposal")}: </strong>
                    <span style={{ fontSize: 13 }}>{tk.proposal}</span>
                  </div>
                )}
                {tk.proof?.length > 0 && (
                  <div className="media-thumbs">
                    {tk.proof.map((m, i) => (
                      <div className="thumb" key={i} style={{ cursor: "zoom-in" }} onClick={() => setLightbox({ items: tk.proof, index: i })}>
                        {m.type === "video" ? <video src={m.url} muted /> : <img src={m.url} alt="proof" />}
                      </div>
                    ))}
                  </div>
                )}
                {tk.status === "submitted" && (
                  <div className="actions-row">
                    <button className="btn btn-accent btn-sm" onClick={() => validateTask(tk, true)}>
                      <IconCheck style={{ width: 14, height: 14 }} /> {t("validate")}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => validateTask(tk, false)}>
                      <IconXCircle style={{ width: 14, height: 14 }} /> {t("requestChanges")}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={requestClose}
        title={editingId ? t("edit") : t("createTask")}
        footer={
          <>
            <button className="btn btn-outline" onClick={requestClose}>{t("cancel")}</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{editingId ? t("save") : t("create")}</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{t("taskTitle")}</label>
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Pour concrete foundation - Block A" />
          </div>
          <div className="field">
            <label>{t("taskDescription")}</label>
            <textarea className="input" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Details about what needs to be done…" />
          </div>
          <div className="row-2">
            <div className="field">
              <label>{t("assignTo")}</label>
              <select className="input" value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)}>
                <option value="">—</option>
                {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>{t("priority")}</label>
              <select className="input" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                <option value="low">{t("low")}</option>
                <option value="medium">{t("medium")}</option>
                <option value="high">{t("high")}</option>
              </select>
            </div>
          </div>
          <div className="row-2">
            {phases.length > 0 && (
              <div className="field">
                <label>{t("selectPhase")}</label>
                <select className="input" value={form.phaseId} onChange={(e) => set("phaseId", e.target.value)}>
                  <option value="">{t("noPhaseSelected")}</option>
                  {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <div className="field">
              <label>{t("dueDate")}</label>
              <input className="input" type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!historyTask}
        onClose={() => setHistoryTask(null)}
        title="Task history"
        footer={<button className="btn btn-primary btn-block" onClick={() => setHistoryTask(null)}>{t("close")}</button>}
      >
        {historyTask && (
          (historyTask.history || []).length === 0 ? (
            <p className="text-muted">No history recorded yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...historyTask.history].reverse().map((h, i) => (
                <div key={i} className="card-flat flex-between">
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{HIST_LABEL[h.action] || h.action}</span>
                  <span className="text-muted" style={{ fontSize: 12 }}>{timeAgo(h.at)}</span>
                </div>
              ))}
            </div>
          )
        )}
      </Modal>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} />

      <MediaLightbox
        items={lightbox?.items}
        index={lightbox?.index || 0}
        onNavigate={(i) => setLightbox((l) => ({ ...l, index: i }))}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
