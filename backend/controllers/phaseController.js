import { pool } from "../config/db.js";
import { uid, mapPhase, serializeJsonField } from "../utils/helpers.js";

export async function getPhases(req, res) {
  try {
    const { projectId } = req.query;
    let query = "SELECT * FROM phases";
    const params = [];
    if (projectId) {
      query += " WHERE project_id = ?";
      params.push(projectId);
    }
    query += " ORDER BY order_index ASC, created_at ASC";

    const [rows] = await pool.query(query, params);
    return res.json({ ok: true, data: rows.map(mapPhase) });
  } catch (err) {
    console.error("Get phases error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function createPhase(req, res) {
  try {
    const {
      id = uid("phase"),
      projectId,
      name,
      budget = 0,
      order = 1,
      status = "not_started",
      notes = "",
      documents = [],
    } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({ ok: false, error: "projectId and name are required" });
    }

    const createdAt = new Date();
    await pool.query(
      `INSERT INTO phases (id, project_id, name, budget, order_index, status, notes, documents, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, name, budget, order, status, notes, serializeJsonField(documents), createdAt]
    );

    const [rows] = await pool.query("SELECT * FROM phases WHERE id = ?", [id]);
    return res.status(201).json({ ok: true, data: mapPhase(rows[0]) });
  } catch (err) {
    console.error("Create phase error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function updatePhase(req, res) {
  try {
    const { id } = req.params;
    const { name, budget, order, status, notes, documents } = req.body;

    const [existing] = await pool.query("SELECT * FROM phases WHERE id = ?", [id]);
    if (existing.length === 0) return res.status(404).json({ ok: false, error: "Phase not found" });

    const current = existing[0];
    const updated = {
      name: name !== undefined ? name : current.name,
      budget: budget !== undefined ? budget : current.budget,
      order: order !== undefined ? order : current.order_index,
      status: status !== undefined ? status : current.status,
      notes: notes !== undefined ? notes : current.notes,
      documents: documents !== undefined ? serializeJsonField(documents) : current.documents,
    };

    await pool.query(
      `UPDATE phases 
       SET name = ?, budget = ?, order_index = ?, status = ?, notes = ?, documents = ?
       WHERE id = ?`,
      [updated.name, updated.budget, updated.order, updated.status, updated.notes, updated.documents, id]
    );

    const [rows] = await pool.query("SELECT * FROM phases WHERE id = ?", [id]);
    return res.json({ ok: true, data: mapPhase(rows[0]) });
  } catch (err) {
    console.error("Update phase error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function deletePhase(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM phases WHERE id = ?", [id]);
    return res.json({ ok: true, message: "Phase deleted" });
  } catch (err) {
    console.error("Delete phase error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
