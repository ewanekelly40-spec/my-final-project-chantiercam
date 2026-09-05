import { pool } from "../config/db.js";
import { seedDatabase } from "../scripts/seed.js";
import {
  mapManager,
  mapProject,
  mapProjectUser,
  mapPhase,
  mapTask,
  mapMaterial,
  mapPayment,
  mapProgress,
  mapDocument,
  mapReport,
  mapMessage,
  mapNotification,
} from "../utils/helpers.js";

export async function getFullStore(req, res) {
  try {
    const [managers] = await pool.query("SELECT * FROM managers");
    const [projects] = await pool.query("SELECT * FROM projects");
    const [projectUsers] = await pool.query("SELECT * FROM project_users");
    const [phases] = await pool.query("SELECT * FROM phases ORDER BY order_index ASC");
    const [tasks] = await pool.query("SELECT * FROM tasks ORDER BY updated_at DESC");
    const [materials] = await pool.query("SELECT * FROM materials ORDER BY purchase_date DESC");
    const [payments] = await pool.query("SELECT * FROM payments ORDER BY date DESC");
    const [progress] = await pool.query("SELECT * FROM progress ORDER BY date DESC");
    const [documents] = await pool.query("SELECT * FROM documents ORDER BY created_at DESC");
    const [reports] = await pool.query("SELECT * FROM reports ORDER BY created_at DESC");
    const [messages] = await pool.query("SELECT * FROM messages ORDER BY created_at ASC");
    const [notifications] = await pool.query("SELECT * FROM notifications ORDER BY created_at DESC");

    const store = {
      managers: managers.map(mapManager),
      projects: projects.map(mapProject),
      projectUsers: projectUsers.map(mapProjectUser),
      phases: phases.map(mapPhase),
      tasks: tasks.map(mapTask),
      materials: materials.map(mapMaterial),
      payments: payments.map(mapPayment),
      progress: progress.map(mapProgress),
      documents: documents.map(mapDocument),
      reports: reports.map(mapReport),
      messages: messages.map(mapMessage),
      notifications: notifications.map(mapNotification),
    };

    return res.json({ ok: true, data: store });
  } catch (err) {
    console.error("Get full store error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function resetDatabase(req, res) {
  try {
    await seedDatabase(true);
    return res.json({ ok: true, message: "Database reset to initial demo state" });
  } catch (err) {
    console.error("Reset database error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
