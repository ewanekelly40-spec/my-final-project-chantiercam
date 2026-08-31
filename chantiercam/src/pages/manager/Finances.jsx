import React, { useMemo, useState } from "react";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import useActiveProject from "../../utils/useActiveProject";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import {
  IconDollar, IconPackage, IconCreditCard, IconTrendUp, IconAlert, IconLayers, IconPrinter,
  IconPlus, IconSearch, IconTrash, IconEdit,
} from "../../components/Icons";
import { uid, formatMoney, formatDate, printReceipt, isDirty } from "../../utils/helpers";
import { useUnsavedGuard, confirmDiscard } from "../../utils/useUnsavedGuard";

const emptyForm = { userId: "", amount: "", date: new Date().toISOString().slice(0, 10), mode: "cash", type: "advance", period: "week", phaseId: "", note: "" };
const modeLabel = { cash: "cash", bank_transfer: "bankTransfer", mobile_money: "mobileMoney", check: "check" };
const typeLabel = { advance: "advance", partial: "partial", full: "full" };
const periodLabel = { day: "perDay", week: "perWeek", month: "perMonth" };

export default function Finances() {
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

  const materials = store.materials.filter((m) => m.projectId === projectId);
  const payments = store.payments.filter((p) => p.projectId === projectId);
  const users = store.projectUsers.filter((u) => u.projectId === projectId);
  const phases = store.phases.filter((p) => p.projectId === projectId).sort((a, b) => (a.order || 0) - (b.order || 0));

  const spentMaterials = materials.reduce((s, m) => s + Number(m.totalPrice || 0), 0);
  const spentPayments = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalSpent = spentMaterials + spentPayments;
  const budget = Number(project?.budget || 0);
  const remaining = budget - totalSpent;
  const pct = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;

  const shownPayments = useMemo(() => {
    const sorted = [...payments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((p) => {
      const user = users.find((u) => u.id === p.userId);
      return [user?.name, p.note].filter(Boolean).some((v) => v.toLowerCase().includes(q));
    });
  }, [payments, users, search]);

  const transactions = useMemo(() => {
    const matTx = materials.map((m) => ({
      id: m.id, date: m.purchaseDate, label: m.name, sub: m.supplier?.name || t("materials"),
      amount: -m.totalPrice, kind: "material", phaseId: m.phaseId,
    }));
    const payTx = payments.map((p) => {
      const u = users.find((x) => x.id === p.userId);
      return { id: p.id, date: p.date, label: u?.name || "—", sub: t("payments"), amount: -p.amount, kind: "payment", phaseId: p.phaseId };
    });
    return [...matTx, ...payTx].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [materials, payments, users, t]);

  function phaseName(id) {
    return phases.find((p) => p.id === id)?.name;
  }

  function spentForPhase(phaseId) {
    const matSpent = materials.filter((m) => m.phaseId === phaseId).reduce((s, m) => s + Number(m.totalPrice || 0), 0);
    const paySpent = payments.filter((p) => p.phaseId === phaseId).reduce((s, p) => s + Number(p.amount || 0), 0);
    return matSpent + paySpent;
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

  function openEdit(p) {
    const f = { userId: p.userId, amount: p.amount, date: p.date, mode: p.mode, type: p.type, period: p.period || "week", phaseId: p.phaseId || "", note: p.note || "" };
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
    if (!form.userId || !form.amount) return;

    if (editingId) {
      updateItem("payments", editingId, {
        phaseId: form.phaseId || null, userId: form.userId, amount: Number(form.amount),
        date: form.date, mode: form.mode, type: form.type, period: form.period, note: form.note,
      });
      showToast(t("save"));
    } else {
      addItem("payments", {
        id: uid("pay"), projectId, phaseId: form.phaseId || null, userId: form.userId,
        amount: Number(form.amount), date: form.date, mode: form.mode, type: form.type,
        period: form.period, note: form.note, createdAt: new Date().toISOString(),
      });
      addItem("notifications", {
        id: uid("notif"), projectId, userId: form.userId,
        title: "Payment recorded", message: `A payment of ${formatMoney(form.amount)} was recorded for you.`,
        read: false, createdAt: new Date().toISOString(),
      });
      showToast(t("recordPayment"));
    }
    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleDelete() {
    removeItem("payments", confirmDelete);
    setConfirmDelete(null);
    showToast("Payment deleted.");
  }

  function handlePrintReceipt(p) {
    const user = users.find((u) => u.id === p.userId);
    printReceipt({ company: "ChantierCam", project: project?.name, worker: user, payment: p });
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t("finances")}</h1>
          <p>{project?.name}</p>
        </div>
        <div className="flex-gap">
          <button className="btn btn-primary" disabled={users.length === 0} onClick={openCreate}>
            <IconPlus style={{ width: 17, height: 17 }} /> {t("recordPayment")}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon"><IconDollar /></div>
          <div className="value">{formatMoney(budget)}</div>
          <div className="label">{t("totalBudget")}</div>
        </div>
        <div className="stat-card">
          <div className="icon"><IconTrendUp /></div>
          <div className="value">{formatMoney(totalSpent)}</div>
          <div className="label">{t("totalSpent")}</div>
        </div>
        <div className="stat-card">
          <div className="icon"><IconPackage /></div>
          <div className="value">{formatMoney(spentMaterials)}</div>
          <div className="label">{t("materialsCost")}</div>
        </div>
        <div className="stat-card">
          <div className="icon"><IconCreditCard /></div>
          <div className="value">{formatMoney(spentPayments)}</div>
          <div className="label">{t("laborCost")}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="flex-between" style={{ marginBottom: 10 }}>
          <h3 style={{ fontSize: 16 }}>{t("remainingBudget")}</h3>
          <strong style={{ color: remaining < 0 ? "var(--danger)" : "var(--success)" }}>{formatMoney(remaining)}</strong>
        </div>
        <div className="progress-bar-outer">
          <div className="progress-bar-inner" style={{ width: `${pct}%`, background: pct > 90 ? "var(--danger)" : "var(--accent)" }} />
        </div>
        {remaining < 0 && (
          <div className="flex-gap" style={{ marginTop: 12, color: "var(--danger)", fontSize: 13 }}>
            <IconAlert style={{ width: 16, height: 16 }} /> Budget exceeded by {formatMoney(Math.abs(remaining))}.
          </div>
        )}
      </div>

      {phases.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title"><h3 className="flex-gap"><IconLayers style={{ width: 17, height: 17 }} /> {t("phases")}</h3></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {phases.map((p) => {
              const spent = spentForPhase(p.id);
              const b = Number(p.budget || 0);
              const ppct = b > 0 ? Math.min(100, Math.round((spent / b) * 100)) : 0;
              return (
                <div key={p.id}>
                  <div className="flex-between" style={{ marginBottom: 6, fontSize: 13.5 }}>
                    <strong>{p.name}</strong>
                    <span className="text-muted">{formatMoney(spent)} / {formatMoney(b)}</span>
                  </div>
                  <div className="progress-bar-outer">
                    <div className="progress-bar-inner" style={{ width: `${ppct}%`, background: ppct > 90 ? "var(--danger)" : "var(--accent)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title flex-between">
          <h3 className="flex-gap"><IconCreditCard style={{ width: 17, height: 17 }} /> {t("payments")}</h3>
          <strong>{formatMoney(spentPayments)}</strong>
        </div>
        {payments.length === 0 ? (
          <div className="empty-state"><IconCreditCard /><p>{t("noPayments")}</p></div>
        ) : (
          <>
            <div className="input-wrap" style={{ marginBottom: 16, maxWidth: 340 }}>
              <IconSearch />
              <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} />
            </div>
            {shownPayments.length === 0 ? (
              <div className="empty-state"><IconSearch /><p>{t("noResults")}</p></div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t("paymentTo")}</th>
                      <th>{t("amount")}</th>
                      <th>{t("phase")}</th>
                      <th>{t("paymentMode")}</th>
                      <th>{t("paymentType")}</th>
                      <th>{t("paymentPeriod")}</th>
                      <th>{t("paymentDate")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownPayments.map((p) => {
                      const user = users.find((u) => u.id === p.userId);
                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{user?.name || "—"}</td>
                          <td style={{ fontWeight: 700 }}>{formatMoney(p.amount)}</td>
                          <td>{phaseName(p.phaseId) ? <span className="badge badge-blue">{phaseName(p.phaseId)}</span> : <span className="text-muted">—</span>}</td>
                          <td><span className="badge badge-gray">{t(modeLabel[p.mode] || p.mode)}</span></td>
                          <td><span className="badge badge-blue">{t(typeLabel[p.type] || p.type)}</span></td>
                          <td><span className="badge badge-orange">{t(periodLabel[p.period] || p.period || "perWeek")}</span></td>
                          <td className="text-muted">{formatDate(p.date)}</td>
                          <td>
                            <div className="flex-gap">
                              <button className="btn btn-ghost btn-icon" title={t("editPayment")} onClick={() => openEdit(p)}>
                                <IconEdit style={{ width: 15, height: 15 }} />
                              </button>
                              <button className="btn btn-ghost btn-icon" title={t("printReceipt")} onClick={() => handlePrintReceipt(p)}>
                                <IconPrinter style={{ width: 15, height: 15 }} />
                              </button>
                              <button className="btn btn-ghost btn-icon" onClick={() => setConfirmDelete(p.id)}>
                                <IconTrash style={{ width: 15, height: 15, color: "var(--danger)" }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <div className="card">
        <div className="section-title"><h3>{t("recentTransactions")}</h3></div>
        {transactions.length === 0 ? (
          <div className="empty-state"><IconDollar /><p>{t("noData")}</p></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>{t("paymentDate")}</th><th></th><th>{t("phase")}</th><th style={{ textAlign: "right" }}>{t("amount")}</th></tr></thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="text-muted">{formatDate(tx.date)}</td>
                    <td style={{ fontWeight: 600 }}>{tx.label}<div><span className={`badge ${tx.kind === "material" ? "badge-blue" : "badge-orange"}`} style={{ marginTop: 4 }}>{tx.sub}</span></div></td>
                    <td className="text-muted">{phaseName(tx.phaseId) || "—"}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--danger)" }}>{formatMoney(tx.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={requestClose}
        title={editingId ? t("editPayment") : t("recordPayment")}
        footer={
          <>
            <button className="btn btn-outline" onClick={requestClose}>{t("cancel")}</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{t("save")}</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{t("paymentTo")}</label>
            <select className="input" value={form.userId} onChange={(e) => set("userId", e.target.value)}>
              <option value="">—</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({t(u.role)})</option>)}
            </select>
          </div>
          <div className="row-2">
            <div className="field">
              <label>{t("amount")} (XAF)</label>
              <input className="input" type="number" min="0" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
            </div>
            <div className="field">
              <label>{t("paymentDate")}</label>
              <input className="input" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
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
              <label>{t("paymentMode")}</label>
              <select className="input" value={form.mode} onChange={(e) => set("mode", e.target.value)}>
                <option value="cash">{t("cash")}</option>
                <option value="bank_transfer">{t("bankTransfer")}</option>
                <option value="mobile_money">{t("mobileMoney")}</option>
                <option value="check">{t("check")}</option>
              </select>
            </div>
            <div className="field">
              <label>{t("paymentType")}</label>
              <select className="input" value={form.type} onChange={(e) => set("type", e.target.value)}>
                <option value="advance">{t("advance")}</option>
                <option value="partial">{t("partial")}</option>
                <option value="full">{t("full")}</option>
              </select>
            </div>
            <div className="field">
              <label>{t("paymentPeriod")}</label>
              <select className="input" value={form.period} onChange={(e) => set("period", e.target.value)}>
                <option value="day">{t("day")}</option>
                <option value="week">{t("week")}</option>
                <option value="month">{t("month")}</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>{t("notes")}</label>
            <textarea className="input" value={form.note} onChange={(e) => set("note", e.target.value)} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
