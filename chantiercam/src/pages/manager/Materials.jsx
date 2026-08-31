import React, { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import useActiveProject from "../../utils/useActiveProject";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { IconPlus, IconPackage, IconTrash, IconEdit, IconSearch } from "../../components/Icons";
import { uid, formatMoney, formatDate, isDirty } from "../../utils/helpers";
import { useUnsavedGuard, confirmDiscard } from "../../utils/useUnsavedGuard";
import { SUGGESTED_MATERIALS } from "../../utils/seed";

const emptyForm = {
  name: "", category: "", quantity: "", unit: "", unitPrice: "", phaseId: "",
  supplierName: "", supplierPhone: "", supplierAddress: "",
  purchaseDate: new Date().toISOString().slice(0, 10), notes: "",
};

export default function Materials() {
  const { store, addItem, updateItem, removeItem } = useData();
  const { t } = useLang();
  const { showToast } = useToast();
  const { project, projectId } = useActiveProject();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState("");

  const dirty = isDirty(form, initialForm);
  useUnsavedGuard(modalOpen && dirty);

  const phases = store.phases.filter((p) => p.projectId === projectId).sort((a, b) => (a.order || 0) - (b.order || 0));

  const allMaterials = store.materials
    .filter((m) => m.projectId === projectId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const materials = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allMaterials;
    return allMaterials.filter((m) =>
      [m.name, m.category, m.supplier?.name, m.unit].filter(Boolean).some((v) => v.toLowerCase().includes(q))
    );
  }, [allMaterials, search]);

  const totalSpent = useMemo(() => allMaterials.reduce((s, m) => s + Number(m.totalPrice || 0), 0), [allMaterials]);

  function phaseName(id) {
    return phases.find((p) => p.id === id)?.name;
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function pickSuggestion(sugg) {
    setForm((f) => ({ ...f, name: sugg.name, category: sugg.category, unit: sugg.unit }));
  }

  function openCreate() {
    setForm(emptyForm);
    setInitialForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(m) {
    const f = {
      name: m.name, category: m.category || "", quantity: m.quantity, unit: m.unit || "", unitPrice: m.unitPrice,
      phaseId: m.phaseId || "", supplierName: m.supplier?.name || "", supplierPhone: m.supplier?.phone || "",
      supplierAddress: m.supplier?.address || "", purchaseDate: m.purchaseDate, notes: m.notes || "",
    };
    setForm(f);
    setInitialForm(f);
    setEditingId(m.id);
    setModalOpen(true);
  }

  function requestClose() {
    if (!confirmDiscard(dirty, t)) return;
    setModalOpen(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.quantity || !form.unitPrice) return;
    const total = Number(form.quantity) * Number(form.unitPrice);
    const payload = {
      phaseId: form.phaseId || null,
      name: form.name,
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      unitPrice: Number(form.unitPrice),
      totalPrice: total,
      supplier: { name: form.supplierName, phone: form.supplierPhone, address: form.supplierAddress },
      purchaseDate: form.purchaseDate,
      notes: form.notes,
    };
    if (editingId) {
      updateItem("materials", editingId, payload);
      showToast(t("save"));
    } else {
      addItem("materials", { id: uid("mat"), projectId, ...payload, createdAt: new Date().toISOString() });
      showToast(t("recordMaterial"));
    }
    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleDelete() {
    removeItem("materials", confirmDelete);
    setConfirmDelete(null);
    showToast("Material entry deleted.");
  }

  const total = (Number(form.quantity) || 0) * (Number(form.unitPrice) || 0);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t("materials")}</h1>
          <p>{project?.name} — {t("totalSpent")}: <strong>{formatMoney(totalSpent)}</strong></p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <IconPlus style={{ width: 17, height: 17 }} /> {t("recordMaterial")}
        </button>
      </div>

      {allMaterials.length === 0 ? (
        <div className="card empty-state"><IconPackage /><h4>{t("noMaterials")}</h4></div>
      ) : (
        <div className="card">
          <div className="input-wrap" style={{ marginBottom: 16, maxWidth: 340 }}>
            <IconSearch />
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} />
          </div>
          {materials.length === 0 ? (
            <div className="empty-state"><IconSearch /><p>{t("noResults")}</p></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("materialName")}</th>
                    <th>{t("category")}</th>
                    <th>{t("phase")}</th>
                    <th>{t("quantity")}</th>
                    <th>{t("unitPrice")}</th>
                    <th>{t("totalPrice")}</th>
                    <th>{t("supplier")}</th>
                    <th>{t("purchaseDate")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td className="text-muted">{m.category || "—"}</td>
                      <td>{phaseName(m.phaseId) ? <span className="badge badge-blue">{phaseName(m.phaseId)}</span> : <span className="text-muted">—</span>}</td>
                      <td>{m.quantity} {m.unit}</td>
                      <td>{formatMoney(m.unitPrice)}</td>
                      <td style={{ fontWeight: 700 }}>{formatMoney(m.totalPrice)}</td>
                      <td className="text-muted">{m.supplier?.name || "—"}</td>
                      <td className="text-muted">{formatDate(m.purchaseDate)}</td>
                      <td>
                        <div className="flex-gap">
                          <button className="btn btn-ghost btn-icon" title={t("editMaterial")} onClick={() => openEdit(m)}>
                            <IconEdit style={{ width: 15, height: 15 }} />
                          </button>
                          <button className="btn btn-ghost btn-icon" onClick={() => setConfirmDelete(m.id)}>
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
      )}

      <Modal
        open={modalOpen}
        onClose={requestClose}
        title={editingId ? t("editMaterial") : t("recordMaterial")}
        size="lg"
        footer={
          <>
            <button className="btn btn-outline" onClick={requestClose}>{t("cancel")}</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{editingId ? t("save") : t("create")}</button>
          </>
        }
      >
        {!editingId && (
          <>
            <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: "block" }}>{t("suggestedMaterials")}</label>
            <div className="chip-row">
              {SUGGESTED_MATERIALS.map((s) => (
                <span key={s.name} className="sugg-chip" onClick={() => pickSuggestion(s)}>{s.name}</span>
              ))}
            </div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{t("materialName")}</label>
            <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Cement (CEM I 42.5)" />
          </div>
          <div className="row-2">
            <div className="field">
              <label>{t("category")}</label>
              <input className="input" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Binders" />
            </div>
            <div className="field">
              <label>{t("purchaseDate")}</label>
              <input className="input" type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} />
            </div>
          </div>
          {phases.length > 0 && (
            <div className="field">
              <label>{t("selectPhase")}</label>
              <select className="input" value={form.phaseId} onChange={(e) => set("phaseId", e.target.value)}>
                <option value="">{t("noPhaseSelected")}</option>
                {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div className="row-3">
            <div className="field">
              <label>{t("quantity")}</label>
              <input className="input" type="number" min="0" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
            </div>
            <div className="field">
              <label>{t("unit")}</label>
              <input className="input" value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="bags, m³, tons…" />
            </div>
            <div className="field">
              <label>{t("unitPrice")} (XAF)</label>
              <input className="input" type="number" min="0" value={form.unitPrice} onChange={(e) => set("unitPrice", e.target.value)} />
            </div>
          </div>
          <div className="card-flat flex-between" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{t("totalPrice")}</span>
            <strong>{formatMoney(total)}</strong>
          </div>

          <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: "block" }}>{t("supplier")}</label>
          <div className="row-2">
            <div className="field">
              <label>{t("supplierName")}</label>
              <input className="input" value={form.supplierName} onChange={(e) => set("supplierName", e.target.value)} placeholder="CIMENCAM Distribution" />
            </div>
            <div className="field">
              <label>{t("supplierPhone")}</label>
              <input className="input" value={form.supplierPhone} onChange={(e) => set("supplierPhone", e.target.value)} placeholder="+237 6 77 12 34 56" />
            </div>
          </div>
          <div className="field">
            <label>{t("supplierAddress")}</label>
            <input className="input" value={form.supplierAddress} onChange={(e) => set("supplierAddress", e.target.value)} placeholder="Zone Industrielle, Yaoundé" />
          </div>
          <div className="field">
            <label>{t("notes")}</label>
            <textarea className="input" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
