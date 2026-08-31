import React, { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import { IconCreditCard, IconPrinter } from "../../components/Icons";
import { formatMoney, formatDate, printReceipt } from "../../utils/helpers";

const modeLabel = { cash: "cash", bank_transfer: "bankTransfer", mobile_money: "mobileMoney", check: "check" };
const typeLabel = { advance: "advance", partial: "partial", full: "full" };
const periodLabel = { day: "perDay", week: "perWeek", month: "perMonth" };

export default function WorkerPayments() {
  const { currentUser, activeProjectId } = useAuth();
  const { store } = useData();
  const { t } = useLang();

  const project = store.projects.find((p) => p.id === activeProjectId);

  const payments = store.payments
    .filter((p) => p.projectId === activeProjectId && p.userId === currentUser.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = useMemo(() => payments.reduce((s, p) => s + Number(p.amount || 0), 0), [payments]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t("myPayments")}</h1>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="flex-between">
          <span className="text-muted" style={{ fontSize: 13 }}>{t("totalReceived")}</span>
          <strong style={{ fontSize: 22 }}>{formatMoney(total)}</strong>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="card empty-state"><IconCreditCard /><h4>{t("noPayments")}</h4></div>
      ) : (
        <div className="cards-grid">
          {payments.map((p) => (
            <div className="card" key={p.id}>
              <div className="flex-between" style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 800 }}>{formatMoney(p.amount)}</span>
                <span className="badge badge-blue">{t(typeLabel[p.type] || p.type)}</span>
              </div>
              <div className="flex-between text-muted" style={{ fontSize: 13 }}>
                <span>{formatDate(p.date)}</span>
                <span className="badge badge-gray">{t(modeLabel[p.mode] || p.mode)}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <span className="badge badge-orange">{t(periodLabel[p.period] || p.period || "perWeek")}</span>
              </div>
              {p.note && <p className="text-muted" style={{ fontSize: 13, marginTop: 10 }}>{p.note}</p>}
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => printReceipt({ company: "ChantierCam", project: project?.name, worker: currentUser, payment: p })}
              >
                <IconPrinter style={{ width: 14, height: 14 }} /> {t("printReceipt")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
