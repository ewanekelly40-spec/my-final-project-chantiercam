export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function formatMoney(amount, currency = "XAF") {
  const n = Number(amount) || 0;
  return `${n.toLocaleString("en-US")} ${currency}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---- unsaved-changes helpers ----
export function isDirty(a, b) {
  try {
    return JSON.stringify(a) !== JSON.stringify(b);
  } catch {
    return false;
  }
}

// ---- CSV export (opens fine in Excel / Google Sheets) ----
export function exportCsv(filename, headers, rows) {
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))];
  // BOM so Excel opens accented / XAF characters correctly
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---- days until a date (negative = overdue) ----
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

// ---- generic printable report window (no library — browser print-to-PDF) ----
export function openReportWindow(title, bodyHtml) {
  const win = window.open("", "_blank", "width=850,height=1000");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Segoe UI, Arial, sans-serif; color: #1b2233; padding: 36px; }
          h1 { font-size: 22px; margin: 0 0 2px; }
          h2 { font-size: 16px; margin: 28px 0 10px; padding-top: 14px; border-top: 1px solid #e2e5ec; }
          .muted { color: #6b7280; font-size: 12.5px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
          th, td { text-align: left; padding: 7px 10px; border-bottom: 1px solid #eef0f4; }
          th { background: #f6f7fb; font-weight: 700; font-size: 11.5px; text-transform: uppercase; color: #6b7280; }
          .kpis { display: flex; gap: 14px; margin-top: 18px; flex-wrap: wrap; }
          .kpi { flex: 1; min-width: 140px; border: 1px solid #e2e5ec; border-radius: 10px; padding: 14px; }
          .kpi .v { font-size: 19px; font-weight: 800; }
          .kpi .l { font-size: 11.5px; color: #6b7280; margin-top: 3px; }
          .bar-outer { background: #eef0f4; border-radius: 6px; height: 8px; overflow: hidden; margin-top: 4px; }
          .bar-inner { background: #2f57d6; height: 100%; }
          .right { text-align: right; }
          .badge { display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #e8edfc; color: #2f57d6; }
          @media print { body { padding: 14mm; } }
        </style>
      </head>
      <body>${bodyHtml}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}
export function printReceipt({ company, project, worker, payment }) {
  const modeLabels = { cash: "Espèces / Cash", bank_transfer: "Virement bancaire", mobile_money: "Mobile Money", check: "Chèque" };
  const typeLabels = { advance: "Avance", partial: "Paiement partiel", full: "Paiement intégral" };
  const periodLabels = { day: "Journalier", week: "Hebdomadaire", month: "Mensuel" };
  const win = window.open("", "_blank", "width=700,height=900");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>Reçu de paiement</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Segoe UI, Arial, sans-serif; color: #1b2233; padding: 40px; }
          h1 { font-size: 20px; margin-bottom: 2px; }
          .muted { color: #6b7280; font-size: 13px; }
          .box { border: 1px solid #e2e5ec; border-radius: 10px; padding: 22px; margin-top: 22px; }
          .row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #f0f1f5; font-size: 14px; }
          .row:last-child { border-bottom: none; }
          .amount { font-size: 26px; font-weight: 800; margin: 18px 0; }
          .sign { display: flex; justify-content: space-between; margin-top: 60px; font-size: 13px; }
          .sign div { width: 40%; border-top: 1px solid #999; padding-top: 6px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${company || "ChantierCam"}</h1>
        <div class="muted">Reçu de paiement — Payment Receipt</div>
        <div class="box">
          <div class="row"><span>Chantier / Project</span><strong>${project || "—"}</strong></div>
          <div class="row"><span>Bénéficiaire / Worker</span><strong>${worker?.name || "—"}</strong></div>
          <div class="row"><span>Poste / Position</span><strong>${worker?.position || "—"}</strong></div>
          <div class="row"><span>Date</span><strong>${formatDate(payment.date)}</strong></div>
          <div class="row"><span>Mode de paiement</span><strong>${modeLabels[payment.mode] || payment.mode}</strong></div>
          <div class="row"><span>Type</span><strong>${typeLabels[payment.type] || payment.type}</strong></div>
          ${payment.period ? `<div class="row"><span>Périodicité</span><strong>${periodLabels[payment.period] || payment.period}</strong></div>` : ""}
          ${payment.note ? `<div class="row"><span>Note</span><strong>${payment.note}</strong></div>` : ""}
        </div>
        <div class="amount">${formatMoney(payment.amount)}</div>
        <div class="sign">
          <div>Signature — Payeur</div>
          <div>Signature — Bénéficiaire</div>
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}
