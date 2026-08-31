import React, { useState, useMemo, useEffect, useRef } from "react";
import { useData } from "../context/DataContext";
import { useLang } from "../context/LanguageContext";
import { IconSend, IconMessage } from "./Icons";
import { uid, initials, timeAgo } from "../utils/helpers";

export default function ChatBox({ projectId, currentUserId, contacts }) {
  const { store, addItem, updateItem } = useData();
  const { t } = useLang();
  const [activeId, setActiveId] = useState(contacts[0]?.id || null);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!activeId && contacts[0]) setActiveId(contacts[0].id);
  }, [contacts, activeId]);

  const allMsgs = store.messages.filter((m) => m.projectId === projectId);

  const thread = useMemo(() => {
    return allMsgs
      .filter((m) => (m.from === currentUserId && m.to === activeId) || (m.from === activeId && m.to === currentUserId))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [allMsgs, currentUserId, activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    // mark as read
    allMsgs.filter((m) => m.to === currentUserId && m.from === activeId && !m.read).forEach((m) => updateItem("messages", m.id, { read: true }));
    // eslint-disable-next-line
  }, [thread.length, activeId]);

  function lastMessage(contactId) {
    const msgs = allMsgs.filter((m) => (m.from === contactId && m.to === currentUserId) || (m.to === contactId && m.from === currentUserId));
    return msgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }

  function unreadFrom(contactId) {
    return allMsgs.filter((m) => m.from === contactId && m.to === currentUserId && !m.read).length;
  }

  function send() {
    if (!text.trim() || !activeId) return;
    const msg = { id: uid("msg"), projectId, from: currentUserId, to: activeId, text: text.trim(), createdAt: new Date().toISOString(), read: false };
    addItem("messages", msg);
    addItem("notifications", {
      id: uid("notif"),
      projectId,
      userId: activeId,
      title: "New message",
      message: text.trim().slice(0, 80),
      read: false,
      createdAt: new Date().toISOString(),
    });
    setText("");
  }

  const activeContact = contacts.find((c) => c.id === activeId);

  return (
    <div className="chat-shell">
      <div className="chat-list">
        {contacts.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}><IconMessage /><p>{t("noData")}</p></div>
        ) : (
          contacts.map((c) => {
            const last = lastMessage(c.id);
            const unread = unreadFrom(c.id);
            return (
              <div key={c.id} className={`chat-list-item ${activeId === c.id ? "active" : ""}`} onClick={() => setActiveId(c.id)}>
                <div className="avatar">{initials(c.name)}</div>
                <div className="meta">
                  <div className="name">{c.name}</div>
                  <div className="last">{last ? last.text : "—"}</div>
                </div>
                {unread > 0 && <span className="badge badge-blue">{unread}</span>}
              </div>
            );
          })
        )}
      </div>
      <div className="chat-window">
        {!activeContact ? (
          <div className="empty-state" style={{ margin: "auto" }}><IconMessage /><p>{t("selectConversation")}</p></div>
        ) : (
          <>
            <div className="chat-header">
              <div className="avatar" style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                {initials(activeContact.name)}
              </div>
              {activeContact.name}
            </div>
            <div className="chat-messages" ref={scrollRef}>
              {thread.map((m) => (
                <div key={m.id} className={`bubble ${m.from === currentUserId ? "mine" : "theirs"}`}>
                  {m.text}
                  <span className="time">{timeAgo(m.createdAt)}</span>
                </div>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                className="input"
                placeholder={t("typeMessage")}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              />
              <button className="btn btn-primary" onClick={send}><IconSend style={{ width: 16, height: 16 }} /></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
