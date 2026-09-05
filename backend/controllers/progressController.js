import { pool } from "../config/db.js";
import { uid, mapProgress, serializeJsonField } from "../utils/helpers.js";

export async function getProgress(req, res) {
  try {
    const { projectId, phaseId } = req.query;
    let query = "SELECT * FROM progress WHERE 1=1";
    const params = [];

    if (projectId) {
      query += " AND project_id = ?";
      params.push(projectId);
    }
    if (phaseId) {
      query += " AND phase_id = ?";
      params.push(phaseId);
    }

    query += " ORDER BY date DESC, created_at DESC";

    const [rows] = await pool.query(query, params);
    return res.json({ ok: true, data: rows.map(mapProgress) });
  } catch (err) {
    console.error("Get progress error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function createProgress(req, res) {
  try {
    const {
      id = uid("prog"),
      projectId,
      phaseId = null,
      title,
      phase = "",
      note = "",
      media = [],
      date = null,
    } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ ok: false, error: "projectId and title are required" });
    }

    const createdAt = new Date();
    await pool.query(
      `INSERT INTO progress (id, project_id, phase_id, title, phase, note, media, date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        phaseId || null,
        title,
        phase,
        note,
        serializeJsonField(media),
        date || new Date().toISOString().slice(0, 10),
        createdAt,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM progress WHERE id = ?", [id]);
    return res.status(201).json({ ok: true, data: mapProgress(rows[0]) });
  } catch (err) {
    console.error("Create progress error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function updateProgress(req, res) {
  try {
    const { id } = req.params;
    const { phaseId, title, phase, note, media, date } = req.body;

    const [existing] = await pool.query("SELECT * FROM progress WHERE id = ?", [id]);
    if (existing.length === 0) return res.status(404).json({ ok: false, error: "Progress entry not found" });

    const current = existing[0];
    const updated = {
      phaseId: phaseId !== undefined ? phaseId : current.phase_id,
      title: title !== undefined ? title : current.title,
      phase: phase !== undefined ? phase : current.phase,
      note: note !== undefined ? note : current.note,
      media: media !== undefined ? serializeJsonField(media) : current.media,
      date: date !== undefined ? date : current.date,
    };

    await pool.query(
      `UPDATE progress
       SET phase_id = ?, title = ?, phase = ?, note = ?, media = ?, date = ?
       WHERE id = ?`,
      [updated.phaseId, updated.title, updated.phase, updated.note, updated.media, updated.date, id]
    );

    const [rows] = await pool.query("SELECT * FROM progress WHERE id = ?", [id]);
    return res.json({ ok: true, data: mapProgress(rows[0]) });
  } catch (err) {
    console.error("Update progress error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function deleteProgress(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM progress WHERE id = ?", [id]);
    return res.json({ ok: true, message: "Progress deleted" });
  } catch (err) {
    console.error("Delete progress error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
