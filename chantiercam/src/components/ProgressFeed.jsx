import React, { useState, useRef, useMemo } from "react";
import { useData } from "../context/DataContext";
import { useLang } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import MediaLightbox from "./MediaLightbox";
import { IconPlus, IconCamera, IconUpload, IconTrash, IconX } from "./Icons";
import { uid, formatDate, fileToDataUrl, isDirty } from "../utils/helpers";
import { useUnsavedGuard, confirmDiscard } from "../utils/useUnsavedGuard";
import api, { resolveMediaUrl } from "../services/api";

const emptyForm = { title: "", phaseId: "", note: "", date: new Date().toISOString().slice(0, 10) };

export default function ProgressFeed({ projectId, canAdd }) {
  const { store, addItem, removeItem } = useData();
  const { t } = useLang();
  const { showToast } = useToast();
  const fileRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [media, setMedia] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [lightbox, setLightbox] = useState(null); // { items, index }
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState("all");

  const phases = store.phases
    .filter((p) => p.projectId === projectId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const dirty = isDirty({ ...form, mediaCount: media.length }, { ...initialForm, mediaCount: 0 });
  useUnsavedGuard(modalOpen && dirty);

  const allUpdates = store.progress
    .filter((p) => p.projectId === projectId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const updates = useMemo(
    () => (phaseFilter === "all" ? allUpdates : allUpdates.filter((u) => u.phaseId === phaseFilter)),
    [allUpdates, phaseFilter]
  );

  function phaseName(id) {
    return phases.find((p) => p.id === id)?.name;
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleFiles(e) {
    if (uploading) return;
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    try {
      // Try backend upload first
      const uploadRes = await api.uploadFiles(files);
      if (uploadRes && uploadRes.ok && uploadRes.data) {
        setMedia((m) => [...m, ...uploadRes.data]);
      } else {
        // Fallback to data URL
        const items = await Promise.all(
          files.map(async (file) => ({
            type: file.type.startsWith("video") ? "video" : "image",
            url: await fileToDataUrl(file),
          }))
        );
        setMedia((m) => [...m, ...items]);
      }
    } catch (err) {
      console.warn("Upload fallback to data URLs:", err);
      const items = await Promise.all(
        files.map(async (file) => ({
          type: file.type.startsWith("video") ? "video" : "image",
          url: await fileToDataUrl(file),
        }))
      );
      setMedia((m) => [...m, ...items]);
    } finally {
      setUploading(false);
    }
  }

  function removeMedia(i) {
    setMedia((m) => m.filter((_, idx) => idx !== i));
  }

  function requestClose() {
    if (submitting) return;
    if (!confirmDiscard(dirty, t)) return;
    setModalOpen(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (submitting || !form.title) return;
    setSubmitting(true);
    const hasPhases = phases.length > 0;
    addItem("progress", {
      id: uid("prog"),
      projectId,
      title: form.title,
      phaseId: hasPhases ? (form.phaseId || null) : null,
      phase: hasPhases ? (phaseName(form.phaseId) || "") : form.phaseId,
      note: form.note,
      date: form.date,
      media,
      createdAt: new Date().toISOString(),
    });

    // notify all users of this project
    const project = store.projects.find((p) => p.id === projectId);
    const projectUsers = store.projectUsers.filter((u) => u.projectId === projectId);
    projectUsers.forEach((u) => {
      addItem("notifications", {
        id: uid("notif"),
        projectId,
        userId: u.id,
        title: "Progress update",
        message: `New update posted: ${form.title}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    showToast(t("addUpdate"));
    setForm(emptyForm);
    setInitialForm(emptyForm);
    setMedia([]);
    setModalOpen(false);
    setSubmitting(false);
  }

  function handleDelete(id) {
    removeItem("progress", id);
    setConfirmDelete(null);
    showToast(t("delete"));
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <h3>{t("progressFeed")}</h3>
          <p className="text-muted" style={{ fontSize: 13 }}>
            {updates.length} {t("progress").toLowerCase()}
          </p>
        </div>
        {canAdd && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setForm(emptyForm);
              setInitialForm(emptyForm);
              setMedia([]);
              setModalOpen(true);
            }}
          >
            <IconPlus style={{ width: 14, height: 14 }} /> {t("addUpdate")}
          </button>
        )}
      </div>

      {phases.length > 0 && (
        <div className="tab-pills" style={{ marginBottom: 16, overflowX: "auto" }}>
          <button
            className={`tab-btn ${phaseFilter === "all" ? "active" : ""}`}
            onClick={() => setPhaseFilter("all")}
          >
            {t("allPhases")}
          </button>
          {phases.map((p) => (
            <button
              key={p.id}
              className={`tab-btn ${phaseFilter === p.id ? "active" : ""}`}
              onClick={() => setPhaseFilter(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {updates.length === 0 ? (
        <div className="card empty-state">
          <IconCamera />
          <h4>{t("noUpdates")}</h4>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {updates.map((u) => (
            <div className="progress-item" key={u.id}>
              <div className="head">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15.5 }}>{u.title}</div>
                  <div className="text-muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                    {(u.phase || phaseName(u.phaseId)) && (
                      <span className="badge badge-blue" style={{ marginRight: 8 }}>
                        {u.phase || phaseName(u.phaseId)}
                      </span>
                    )}
                    {formatDate(u.date)}
                  </div>
                </div>
                {canAdd && (
                  <button className="btn btn-ghost btn-icon" onClick={() => setConfirmDelete(u.id)}>
                    <IconTrash style={{ width: 15, height: 15, color: "var(--danger)" }} />
                  </button>
                )}
              </div>
              {u.note && <div className="note">{u.note}</div>}
              {u.media?.length > 0 && (
                <div className="gallery">
                  {u.media.map((m, i) => (
                    <div
                      className="g-item"
                      key={i}
                      title="Click to view and download"
                      style={{ cursor: "zoom-in" }}
                      onClick={() => setLightbox({ items: u.media, index: i })}
                    >
                      {m.type === "video" ? (
                        <video src={resolveMediaUrl(m.url)} muted />
                      ) : (
                        <img src={resolveMediaUrl(m.url)} alt={u.title} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={requestClose}
        title={t("addUpdate")}
        footer={
          <>
            <button type="button" className="btn btn-outline" disabled={submitting} onClick={requestClose}>{t("cancel")}</button>
            <button type="button" className="btn btn-primary" disabled={submitting || uploading} onClick={handleSubmit}>{t("save")}</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{t("updateTitle")}</label>
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Foundation excavation complete" />
          </div>
          <div className="row-2">
            <div className="field">
              <label>{t("phase")}</label>
              {phases.length > 0 ? (
                <select className="input" value={form.phaseId} onChange={(e) => set("phaseId", e.target.value)}>
                  <option value="">{t("noPhaseSelected")}</option>
                  {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              ) : (
                <input className="input" value={form.phaseId} onChange={(e) => set("phaseId", e.target.value)} placeholder="Foundation, Framing, Roofing…" />
              )}
            </div>
            <div className="field">
              <label>{t("paymentDate")}</label>
              <input className="input" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>{t("notes")}</label>
            <textarea className="input" value={form.note} onChange={(e) => set("note", e.target.value)} />
          </div>
          <div className="field">
            <label>{t("uploadMedia")}</label>
            <div className="upload-drop" onClick={() => !uploading && fileRef.current?.click()}>
              <IconUpload style={{ width: 22, height: 22, margin: "0 auto 8px" }} />
              {uploading ? "Uploading…" : "Click to upload photos or videos"}
            </div>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={handleFiles} disabled={uploading} />
            {media.length > 0 && (
              <div className="preview-grid">
                {media.map((m, i) => (
                  <div className="p-item" key={i}>
                    {m.type === "video" ? <video src={m.url} /> : <img src={m.url} alt="preview" />}
                    <div className="rm" onClick={() => removeMedia(i)}><IconX style={{ width: 11, height: 11 }} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
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
