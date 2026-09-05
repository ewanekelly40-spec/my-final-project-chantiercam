import { pool } from "../config/db.js";
import { uid, mapReport, serializeJsonField } from "../utils/helpers.js";

export async function getReports(req, res) {
  try {
    const { projectId } = req.query;
    let query = "SELECT * FROM reports";
    const params = [];

    if (projectId) {
      query += " WHERE project_id = ?";
      params.push(projectId);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.query(query, params);
    return res.json({ ok: true, data: rows.map(mapReport) });
  } catch (err) {
    console.error("Get reports error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function createReport(req, res) {
  try {
    const {
      id = uid("rep"),
      projectId,
      title,
      period = "",
      note = "",
      data = {},
    } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ ok: false, error: "projectId and title are required" });
    }

    const createdAt = new Date();
    await pool.query(
      `INSERT INTO reports (id, project_id, title, period, note, data, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, title, period, note, serializeJsonField(data), createdAt]
    );

    const [rows] = await pool.query("SELECT * FROM reports WHERE id = ?", [id]);
    return res.status(201).json({ ok: true, data: mapReport(rows[0]) });
  } catch (err) {
    console.error("Create report error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function updateReport(req, res) {
  try {
    const { id } = req.params;
    const { title, period, note, data } = req.body;

    const [existing] = await pool.query("SELECT * FROM reports WHERE id = ?", [id]);
    if (existing.length === 0) return res.status(404).json({ ok: false, error: "Report not found" });

    const current = existing[0];
    const updated = {
      title: title !== undefined ? title : current.title,
      period: period !== undefined ? period : current.period,
      note: note !== undefined ? note : current.note,
      data: data !== undefined ? serializeJsonField(data) : current.data,
    };

    await pool.query(
      `UPDATE reports SET title = ?, period = ?, note = ?, data = ? WHERE id = ?`,
      [updated.title, updated.period, updated.note, updated.data, id]
    );

    const [rows] = await pool.query("SELECT * FROM reports WHERE id = ?", [id]);
    return res.json({ ok: true, data: mapReport(rows[0]) });
  } catch (err) {
    console.error("Update report error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function deleteReport(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM reports WHERE id = ?", [id]);
    return res.json({ ok: true, message: "Report deleted" });
  } catch (err) {
    console.error("Delete report error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
