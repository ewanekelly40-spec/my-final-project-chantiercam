import React, { useEffect } from "react";
import { IconX, IconUpload, IconChevronLeft, IconChevronRight } from "./Icons";
import { resolveMediaUrl } from "../services/api";

// Usage: <MediaLightbox items={[{type,url}, ...]} index={0} onClose={fn} onNavigate={setIndex} />
// Backward compatible with the old single-`media` prop.
export default function MediaLightbox({ media, items, index = 0, onClose, onNavigate }) {
  const list = (items && items.length > 0 ? items : media ? [media] : []).map((it) => ({
    ...it,
    url: resolveMediaUrl(it.url),
  }));
  const current = list[index];

  useEffect(() => {
    if (!current) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight" && onNavigate && index < list.length - 1) onNavigate(index + 1);
      if (e.key === "ArrowLeft" && onNavigate && index > 0) onNavigate(index - 1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, index, list.length, onClose, onNavigate]);

  if (!current) return null;

  const filename = `chantiercam-${current.type === "video" ? "video" : "photo"}-${Date.now()}.${current.type === "video" ? "mp4" : "jpg"}`;

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal" style={{ maxWidth: 720, background: "transparent", boxShadow: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
            {list.length > 1 ? `${index + 1} / ${list.length}` : ""}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <a className="btn btn-primary btn-sm" href={current.url} download={filename}>
              <IconUpload style={{ width: 14, height: 14, transform: "rotate(180deg)" }} /> Download
            </a>
            <button className="btn btn-outline btn-sm" onClick={onClose} style={{ background: "#fff" }}>
              <IconX style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
        <div style={{ position: "relative", background: "#000", borderRadius: 16, overflow: "hidden", maxHeight: "78vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {list.length > 1 && index > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate?.(index - 1); }}
              style={navBtnStyle("left")}
            ><IconChevronLeft style={{ width: 20, height: 20 }} /></button>
          )}
          {current.type === "video" ? (
            <video src={current.url} controls autoPlay style={{ maxWidth: "100%", maxHeight: "78vh" }} />
          ) : (
            <img src={current.url} alt="Full size" style={{ maxWidth: "100%", maxHeight: "78vh", objectFit: "contain" }} />
          )}
          {list.length > 1 && index < list.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate?.(index + 1); }}
              style={navBtnStyle("right")}
            ><IconChevronRight style={{ width: 20, height: 20 }} /></button>
          )}
        </div>
      </div>
    </div>
  );
}

function navBtnStyle(side) {
  return {
    position: "absolute",
    [side]: 10,
    top: "50%",
    transform: "translateY(-50%)",
    width: 38,
    height: 38,
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,.9)",
    color: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };
}
