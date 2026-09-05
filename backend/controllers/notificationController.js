import { pool } from "../config/db.js";
import { uid, mapNotification } from "../utils/helpers.js";

export async function getNotifications(req, res) {
  try {
    const { projectId, userId } = req.query;
    let query = "SELECT * FROM notifications WHERE 1=1";
    const params = [];

    if (projectId) {
      query += " AND project_id = ?";
      params.push(projectId);
    }
    if (userId) {
      query += " AND user_id = ?";
      params.push(userId);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.query(query, params);
    return res.json({ ok: true, data: rows.map(mapNotification) });
  } catch (err) {
    console.error("Get notifications error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function createNotification(req, res) {
  try {
    const {
      id = uid("notif"),
      projectId,
      userId,
      title,
      message,
      read = false,
    } = req.body;

    if (!projectId || !userId || !title) {
      return res.status(400).json({ ok: false, error: "projectId, userId, and title are required" });
    }

    const createdAt = new Date();
    await pool.query(
      `INSERT INTO notifications (id, project_id, user_id, title, message, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, userId, title, message || "", read ? 1 : 0, createdAt]
    );

    const [rows] = await pool.query("SELECT * FROM notifications WHERE id = ?", [id]);
    return res.status(201).json({ ok: true, data: mapNotification(rows[0]) });
  } catch (err) {
    console.error("Create notification error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params;
    await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
    return res.json({ ok: true, message: "Notification marked as read" });
  } catch (err) {
    console.error("Mark notification read error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function markAllNotificationsRead(req, res) {
  try {
    const { userId, projectId } = req.body;
    let query = "UPDATE notifications SET is_read = 1 WHERE 1=1";
    const params = [];

    if (userId) {
      query += " AND user_id = ?";
      params.push(userId);
    }
    if (projectId) {
      query += " AND project_id = ?";
      params.push(projectId);
    }

    await pool.query(query, params);
    return res.json({ ok: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark all notifications read error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
