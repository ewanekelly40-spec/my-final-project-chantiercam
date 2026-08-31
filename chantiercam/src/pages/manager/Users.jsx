import React, { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import useActiveProject from "../../utils/useActiveProject";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { IconPlus, IconUsers, IconTrash, IconCopy, IconMail, IconPhone, IconEdit, IconEye, IconEyeOff, IconLock, IconSearch } from "../../components/Icons";
import { uid, generatePassword, initials, isDirty } from "../../utils/helpers";
import { useUnsavedGuard, confirmDiscard } from "../../utils/useUnsavedGuard";

const emptyForm = { role: "worker", name: "", email: "", phone: "", address: "", idNumber: "", position: "", emergencyContact: "" };
const emptyEdit = { name: "", email: "", password: "", phone: "", address: "", idNumber: "", position: "", emergencyContact: "" };

export default function Users() {
  const { store, addItem, removeItem, updateItem } = useData();
  const { t } = useLang();
  const { showToast } = useToast();
  const { project, projectId } = useActiveProject();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [credsModal, setCredsModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [tab, setTab] = useState("worker");
  const [search, setSearch] = useState("");

  const [editUserId, setEditUserId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [initialEditForm, setInitialEditForm] = useState(emptyEdit);
  const [showEditPw, setShowEditPw] = useState(false);
  const [editError, setEditError] = useState("");

  const dirty = isDirty(form, initialForm);
  const editDirty = isDirty(editForm, initialEditForm);
  useUnsavedGuard(modalOpen && dirty);
  useUnsavedGuard(!!editUserId && editDirty);

  const users = store.projectUsers.filter((u) => u.projectId === projectId);
  const shown = useMemo(() => {
    const base = users.filter((u) => u.role === tab);
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((u) => [u.name, u.email, u.phone, u.position].filter(Boolean).some((v) => v.toLowerCase().includes(q)));
  }, [users, tab, search]);

  function requestCloseCreate() {
    if (!confirmDiscard(dirty, t)) return;
    setModalOpen(false);
  }

  function requestCloseEdit() {
    if (!confirmDiscard(editDirty, t)) return;
    setEditUserId(null);
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    const emailBase = form.email?.trim() || `${form.name.toLowerCase().replace(/[^a-z]+/g, ".")}@chantiercam.com`;
    const exists = store.projectUsers.some((u) => u.email.toLowerCase() === emailBase.toLowerCase());
    const email = exists ? emailBase.replace("@", `${Math.floor(Math.random() * 900 + 100)}@`) : emailBase;
    const password = generatePassword();
    const id = uid("user");

    addItem("projectUsers", {
      id,
      projectId,
      role: form.role,
      name: form.name,
      email,
      password,
      phone: form.phone,
      address: form.address,
      idNumber: form.idNumber,
      position: form.position,
      emergencyContact: form.emergencyContact,
      createdAt: new Date().toISOString(),
      suspended: false,
    });

    addItem("notifications", {
      id: uid("notif"),
      projectId,
      userId: id,
      title: "Welcome to ChantierCam",
      message: `Your account for "${project.name}" has been created.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    setModalOpen(false);
    setForm(emptyForm);
    setCredsModal({ name: form.name, email, password, role: form.role });
    showToast(t("createUserAccount"));
  }

  function handleDelete() {
    removeItem("projectUsers", confirmDelete);
    setConfirmDelete(null);
    showToast("Account deleted.");
  }

  function copy(text) {
    navigator.clipboard?.writeText(text);
    showToast(t("copied"));
  }

  function openEditUser(u) {
    setEditUserId(u.id);
    const f = {
      name: u.name, email: u.email, password: u.password, phone: u.phone,
      address: u.address || "", idNumber: u.idNumber || "", position: u.position || "", emergencyContact: u.emergencyContact || "",
    };
    setEditForm(f);
    setInitialEditForm(f);
    setShowEditPw(false);
    setEditError("");
  }

  function setEdit(field, value) {
    setEditForm((f) => ({ ...f, [field]: value }));
  }

  function regenerateEditPassword() {
    setEditForm((f) => ({ ...f, password: generatePassword() }));
    setShowEditPw(true);
  }

  function saveEditUser(e) {
    e.preventDefault();
    setEditError("");
    if (!editForm.name || !editForm.email || !editForm.password) {
      setEditError(t("fillAllFields"));
      return;
    }
    const clash = store.projectUsers.some(
      (u) => u.id !== editUserId && u.email.toLowerCase() === editForm.email.trim().toLowerCase()
    );
    if (clash) {
      setEditError(t("emailInUse"));
      return;
    }
    updateItem("projectUsers", editUserId, {
      name: editForm.name,
      email: editForm.email.trim(),
      password: editForm.password,
      phone: editForm.phone,
      address: editForm.address,
      idNumber: editForm.idNumber,
      position: editForm.position,
      emergencyContact: editForm.emergencyContact,
    });
    setEditUserId(null);
    showToast(t("save"));
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t("users")}</h1>
          <p>{project?.name}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { const f = { ...emptyForm, role: tab }; setForm(f); setInitialForm(f); setModalOpen(true); }}>
          <IconPlus style={{ width: 17, height: 17 }} /> {t("createUserAccount")}
        </button>
      </div>

      <div className="tabs-row">
        <button className={`tab-btn ${tab === "worker" ? "active" : ""}`} onClick={() => setTab("worker")}>{t("worker")}s ({users.filter(u=>u.role==="worker").length})</button>
        <button className={`tab-btn ${tab === "client" ? "active" : ""}`} onClick={() => setTab("client")}>{t("client")}s ({users.filter(u=>u.role==="client").length})</button>
      </div>

      {users.filter((u) => u.role === tab).length > 0 && (
        <div className="input-wrap" style={{ marginBottom: 16, maxWidth: 340 }}>
          <IconSearch />
          <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} />
        </div>
      )}

      {shown.length === 0 ? (
        <div className="card empty-state">
          <IconUsers />
          <h4>{search ? t("noResults") : t("noData")}</h4>
        </div>
      ) : (
        <div className="cards-grid">
          {shown.map((u) => (
            <div key={u.id} className="card">
              <div className="flex-gap" style={{ marginBottom: 12 }}>
                <div className="avatar" style={{ background: "var(--accent-soft)", color: "var(--accent)", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                  {initials(u.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{u.name}</div>
                  <div className="text-muted" style={{ fontSize: 12.5 }}>{u.position || t(u.role)}</div>
                </div>
                <span className={`badge ${u.suspended ? "badge-red" : "badge-green"}`}>{u.suspended ? t("suspended") : t("active")}</span>
              </div>
              <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="flex-gap text-muted"><IconMail style={{ width: 14, height: 14 }} /> {u.email}</span>
                <span className="flex-gap text-muted"><IconPhone style={{ width: 14, height: 14 }} /> {u.phone}</span>
              </div>
              <div className="flex-gap" style={{ marginTop: 14 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setCredsModal({ name: u.name, email: u.email, password: u.password, role: u.role })}>{t("generatedCredentials")}</button>
                <button className="btn btn-ghost btn-icon" onClick={() => openEditUser(u)}>
                  <IconEdit style={{ width: 15, height: 15 }} />
                </button>
                <button className="btn btn-ghost btn-icon" onClick={() => setConfirmDelete(u.id)}>
                  <IconTrash style={{ width: 15, height: 15, color: "var(--danger)" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={requestCloseCreate}
        title={t("createUserAccount")}
        footer={
          <>
            <button className="btn btn-outline" onClick={requestCloseCreate}>{t("cancel")}</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{t("create")}</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{t("role")}</label>
            <select className="input" value={form.role} onChange={(e) => set("role", e.target.value)}>
              <option value="worker">{t("worker")}</option>
              <option value="client">{t("client")}</option>
            </select>
          </div>
          <div className="field">
            <label>{t("fullName")}</label>
            <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jean Fotso" />
          </div>
          <div className="row-2">
            <div className="field">
              <label>{t("email")} <span className="text-muted">(optional — auto-generated)</span></label>
              <input className="input" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="auto-generated" />
            </div>
            <div className="field">
              <label>{t("phone")}</label>
              <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+237 6 70 11 22 33" />
            </div>
          </div>
          <div className="field">
            <label>{form.role === "worker" ? "Position / Trade" : "Company / Title"}</label>
            <input className="input" value={form.position} onChange={(e) => set("position", e.target.value)} placeholder={form.role === "worker" ? "Mason, Electrician…" : "Property Owner"} />
          </div>
          <div className="field">
            <label>{t("address")}</label>
            <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Mendong, Yaoundé" />
          </div>
          <div className="row-2">
            <div className="field">
              <label>{t("idNumber")}</label>
              <input className="input" value={form.idNumber} onChange={(e) => set("idNumber", e.target.value)} placeholder="112233445566" />
            </div>
            <div className="field">
              <label>{t("emergencyContact")}</label>
              <input className="input" value={form.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} placeholder="+237 6 99 88 77 66" />
            </div>
          </div>
          <p className="hint">A secure password will be generated automatically for this project's login.</p>
        </form>
      </Modal>

      <Modal
        open={!!credsModal}
        onClose={() => setCredsModal(null)}
        title={t("generatedCredentials")}
        footer={<button className="btn btn-primary btn-block" onClick={() => setCredsModal(null)}>{t("close")}</button>}
      >
        {credsModal && (
          <>
            <p className="hint" style={{ marginBottom: 14 }}>{t("credentialsHint")}</p>
            <div className="creds-box">
              <div className="creds-row">
                <span className="k">{t("loginEmail")}</span>
                <span className="v flex-gap">{credsModal.email} <IconCopy style={{ width: 14, height: 14, cursor: "pointer" }} onClick={() => copy(credsModal.email)} /></span>
              </div>
              <div className="creds-row">
                <span className="k">{t("tempPassword")}</span>
                <span className="v flex-gap">{credsModal.password} <IconCopy style={{ width: 14, height: 14, cursor: "pointer" }} onClick={() => copy(credsModal.password)} /></span>
              </div>
              <div className="creds-row">
                <span className="k">{t("role")}</span>
                <span className="v">{t(credsModal.role)}</span>
              </div>
              <div className="creds-row">
                <span className="k">{t("projectName")}</span>
                <span className="v">{project?.name}</span>
              </div>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={!!editUserId}
        onClose={requestCloseEdit}
        title={`${t("edit")} — ${t("generatedCredentials")}`}
        footer={
          <>
            <button className="btn btn-outline" onClick={requestCloseEdit}>{t("cancel")}</button>
            <button className="btn btn-primary" onClick={saveEditUser}>{t("save")}</button>
          </>
        }
      >
        <form onSubmit={saveEditUser}>
          <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: "block" }}>{t("generatedCredentials")}</label>
          <div className="field">
            <label>{t("loginEmail")}</label>
            <div className="input-wrap">
              <IconMail />
              <input className="input" value={editForm.email} onChange={(e) => setEdit("email", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>{t("tempPassword")}</label>
            <div className="input-wrap">
              <IconLock />
              <input className="input" type={showEditPw ? "text" : "password"} value={editForm.password} onChange={(e) => setEdit("password", e.target.value)} />
              <span className="input-eye" onClick={() => setShowEditPw((s) => !s)}>
                {showEditPw ? <IconEyeOff /> : <IconEye />}
              </span>
            </div>
            <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={regenerateEditPassword}>
              Regenerate Password
            </button>
          </div>

          <div className="spacer-16" />
          <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: "block" }}>{t("profile")}</label>
          <div className="field">
            <label>{t("fullName")}</label>
            <input className="input" value={editForm.name} onChange={(e) => setEdit("name", e.target.value)} />
          </div>
          <div className="row-2">
            <div className="field">
              <label>{t("phone")}</label>
              <input className="input" value={editForm.phone} onChange={(e) => setEdit("phone", e.target.value)} />
            </div>
            <div className="field">
              <label>{t("idNumber")}</label>
              <input className="input" value={editForm.idNumber} onChange={(e) => setEdit("idNumber", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>{t("address")}</label>
            <input className="input" value={editForm.address} onChange={(e) => setEdit("address", e.target.value)} />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Position / Company</label>
              <input className="input" value={editForm.position} onChange={(e) => setEdit("position", e.target.value)} />
            </div>
            <div className="field">
              <label>{t("emergencyContact")}</label>
              <input className="input" value={editForm.emergencyContact} onChange={(e) => setEdit("emergencyContact", e.target.value)} />
            </div>
          </div>
          {editError && <p style={{ color: "var(--danger)", fontSize: 13.5 }}>{editError}</p>}
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
