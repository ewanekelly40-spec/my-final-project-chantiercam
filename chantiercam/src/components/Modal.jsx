import React from "react";
import { IconX } from "./Icons";

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={`modal ${size === "lg" ? "modal-lg" : ""}`}>
        <div className="modal-head">
          <h3>{title}</h3>
          <div className="modal-close" onClick={onClose}>
            <IconX style={{ width: 18, height: 18 }} />
          </div>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
