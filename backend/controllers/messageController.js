import { pool } from "../config/db.js";
import { uid, mapMessage } from "../utils/helpers.js";

export async function getMessages(req, res) {
  try {
    const { projectId, userId, otherUserId } = req.query;
    let query = "SELECT * FROM messages WHERE 1=1";
    const params = [];

    if (projectId) {
      query += " AND project_id = ?";
      params.push(projectId);
    }
    if (userId && otherUserId) {
      query += " AND ((from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?))";
      params.push(userId, otherUserId, otherUserId, userId);
    } else if (userId) {
      query += " AND (from_user = ? OR to_user = ?)";
      params.push(userId, userId);
    }

    query += " ORDER BY created_at ASC";

    const [rows] = await pool.query(query, params);
    return res.json({ ok: true, data: rows.map(mapMessage) });
  } catch (err) {
    console.error("Get messages error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function sendMessage(req, res) {
  try {
    const {
      id = uid("msg"),
      projectId,
      from,
      to,
      text,
      read = false,
    } = req.body;

    const sender = from || (req.user ? req.user.id : null);
    if (!projectId || !sender || !to || !text) {
      return res.status(400).json({ ok: false, error: "projectId, from, to, and text are required" });
    }

    const createdAt = new Date();
    await pool.query(
      `INSERT INTO messages (id, project_id, from_user, to_user, text, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, sender, to, text, read ? 1 : 0, createdAt]
    );

    const [rows] = await pool.query("SELECT * FROM messages WHERE id = ?", [id]);
    return res.status(201).json({ ok: true, data: mapMessage(rows[0]) });
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function markMessagesAsRead(req, res) {
  try {
    const { projectId, from, to } = req.body;
    if (!projectId || !from || !to) {
      return res.status(400).json({ ok: false, error: "projectId, from, and to are required" });
    }

    await pool.query(
      `UPDATE messages SET is_read = 1 WHERE project_id = ? AND from_user = ? AND to_user = ?`,
      [projectId, from, to]
    );

    return res.json({ ok: true, message: "Messages marked as read" });
  } catch (err) {
    console.error("Mark messages read error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
