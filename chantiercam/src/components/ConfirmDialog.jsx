import React from "react";
import Modal from "./Modal";
import { useLang } from "../context/LanguageContext";

export default function ConfirmDialog({ open, onClose, onConfirm, message, danger = true }) {
  const { t } = useLang();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("delete")}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>{t("no")}</button>
          <button className={`btn ${danger ? "btn-danger" : "btn-accent"}`} onClick={onConfirm}>{t("yes")}</button>
        </>
      }
    >
      <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6 }}>{message || t("confirmDelete")}</p>
    </Modal>
  );
}
