import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import Modal from "../../components/Modal";
import MediaLightbox from "../../components/MediaLightbox";
import { TaskStatusBadge, PriorityBadge } from "../../components/StatusBadge";
import { IconCheckSquare, IconCalendar, IconCheck, IconUpload, IconX, IconCamera } from "../../components/Icons";
import { uid, formatDate, fileToDataUrl, isDirty } from "../../utils/helpers";
import { useUnsavedGuard, confirmDiscard } from "../../utils/useUnsavedGuard";

const FILTERS = ["all", "pending", "accepted", "in_progress", "submitted", "completed"];

export default function WorkerTasks() {
  const { currentUser, activeProjectId } = useAuth();
  const { store, updateItem, addItem } = useData();
  const { t } = useLang();
  const { showToast } = useToast();
  const fileRef = useRef(null);

  const [filter, setFilter] = useState("all");
  const [submitTask, setSubmitTask] = useState(null);
  const [proposal, setProposal] = useState("");
  const [initialProposal, setInitialProposal] = useState("");
  const [media, setMedia] = useState([]);
  const [initialMediaCount, setInitialMediaCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const dirty = isDirty({ proposal, count: media.length }, { proposal: initialProposal, count: initialMediaCount });
  useUnsavedGuard(!!submitTask && dirty);

  const phases = store.phases.filter((p) => p.projectId === activeProjectId);

  const tasks = store.tasks
    .filter((tk) => tk.projectId === activeProjectId && tk.assignedTo === currentUser.id)
    .filter((tk) => filter === "all" || tk.status === filter)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  function phaseName(id) {
    return phases.find((p) => p.id === id)?.name;
  }

  function notifyManager(project, title, message) {
    addItem("notifications", {
      id: uid("notif"),
      projectId: project.id,
      userId: project.managerId,
      title, message, read: false, createdAt: new Date().toISOString(),
    });
  }

  function pushHistory(tk, action) {
    return [...(tk.history || []), { action, at: new Date().toISOString() }];
  }

  function acceptTask(tk) {
    const project = store.projects.find((p) => p.id === tk.projectId);
    updateItem("tasks", tk.id, { status: "accepted", updatedAt: new Date().toISOString(), history: pushHistory(tk, "accepted") });
    notifyManager(project, "Task accepted", `${currentUser.name} accepted: ${tk.title}`);
    showToast(t("accept"));
  }

  function startWork(tk) {
    updateItem("tasks", tk.id, { status: "in_progress", updatedAt: new Date().toISOString() });
  }

  function openSubmit(tk) {
    setSubmitTask(tk);
    setProposal(tk.proposal || "");
    setInitialProposal(tk.proposal || "");
    setMedia(tk.proof || []);
    setInitialMediaCount((tk.proof || []).length);
  }

  function requestCloseSubmit() {
    if (submitting) return;
    if (!confirmDiscard(dirty, t)) return;
    setSubmitTask(null);
  }

  async function handleFiles(e) {
    if (uploading) return;
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    try {
      const items = await Promise.all(
        files.map(async (file) => ({ type: file.type.startsWith("video") ? "video" : "image", url: await fileToDataUrl(file) }))
      );
      setMedia((m) => [...m, ...items]);
    } finally {
      setUploading(false);
    }
  }

  function submitWork() {
    if (submitting || !submitTask) return;
    setSubmitting(true);
    const project = store.projects.find((p) => p.id === submitTask.projectId);
    updateItem("tasks", submitTask.id, {
      status: "submitted", proposal, proof: media, updatedAt: new Date().toISOString(),
      history: pushHistory(submitTask, "submitted"),
    });
    notifyManager(project, "Work submitted", `${currentUser.name} submitted work for: ${submitTask.title}`);
    showToast(t("submitWork"));
    setSubmitTask(null);
    setSubmitting(false);
  }

  return (
    <div>
      <div className="page-head"><div><h1>{t("tasks")}</h1></div></div>

      <div className="tabs-row">
        {FILTERS.map((f) => (
          <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : t(`taskStatus${f.charAt(0).toUpperCase()}${f.slice(1).replace(/_([a-z])/g, (m,c)=>c.toUpperCase())}`)}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="card empty-state"><IconCheckSquare /><h4>{t("noTasks")}</h4></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tasks.map((tk) => (
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
              </div>
              <p className="desc">{tk.description}</p>
              <div className="meta-row"><span><IconCalendar style={{ width: 13, height: 13 }} /> {formatDate(tk.dueDate)}</span></div>

              {tk.proof?.length > 0 && (
                <div className="media-thumbs">
                  {tk.proof.map((m, i) => (
                    <div className="thumb" key={i} style={{ cursor: "zoom-in" }} onClick={() => setLightbox({ items: tk.proof, index: i })}>
                      {m.type === "video" ? <video src={m.url} muted /> : <img src={m.url} alt="proof" />}
                    </div>
                  ))}
                </div>
              )}

              <div className="actions-row">
                {tk.status === "pending" && (
                  <button className="btn btn-accent btn-sm" onClick={() => acceptTask(tk)}><IconCheck style={{ width: 14, height: 14 }} /> {t("accept")}</button>
                )}
                {tk.status === "accepted" && (
                  <button className="btn btn-accent btn-sm" onClick={() => startWork(tk)}>Start Work</button>
                )}
                {(tk.status === "in_progress" || tk.status === "accepted") && (
                  <button className="btn btn-primary btn-sm" onClick={() => openSubmit(tk)}><IconCamera style={{ width: 14, height: 14 }} /> {t("submitWork")}</button>
                )}
                {tk.status === "submitted" && <span className="text-muted" style={{ fontSize: 13 }}>Waiting for manager validation…</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!submitTask}
        onClose={requestCloseSubmit}
        title={t("submitWork")}
        footer={
          <>
            <button type="button" className="btn btn-outline" disabled={submitting} onClick={requestCloseSubmit}>{t("cancel")}</button>
            <button type="button" className="btn btn-primary" disabled={submitting || uploading} onClick={submitWork}>{t("submitWork")}</button>
          </>
        }
      >
        <div className="field">
          <label>{t("proposal")}</label>
          <textarea className="input" value={proposal} onChange={(e) => setProposal(e.target.value)} placeholder="Notes about the work completed…" />
        </div>
        <div className="field">
          <label>{t("attachProof")}</label>
          <div className="upload-drop" onClick={() => !uploading && fileRef.current?.click()}>
            <IconUpload style={{ width: 22, height: 22, margin: "0 auto 8px" }} />
            {uploading ? "Uploading…" : "Snap or upload photo / video of completed work"}
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" capture="environment" multiple hidden onChange={handleFiles} disabled={uploading} />
          {media.length > 0 && (
            <div className="preview-grid">
              {media.map((m, i) => (
                <div className="p-item" key={i}>
                  {m.type === "video" ? <video src={m.url} /> : <img src={m.url} alt="preview" />}
                  <div className="rm" onClick={() => setMedia((mm) => mm.filter((_, idx) => idx !== i))}><IconX style={{ width: 11, height: 11 }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <MediaLightbox
        items={lightbox?.items}
        index={lightbox?.index || 0}
        onNavigate={(i) => setLightbox((l) => ({ ...l, index: i }))}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
