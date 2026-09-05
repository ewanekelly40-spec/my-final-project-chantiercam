import { pool } from "../config/db.js";
import { uid, mapDocument } from "../utils/helpers.js";

export async function getDocuments(req, res) {
  try {
    const { projectId, phaseId } = req.query;
    let query = "SELECT * FROM documents WHERE 1=1";
    const params = [];

    if (projectId) {
      query += " AND project_id = ?";
      params.push(projectId);
    }
    if (phaseId) {
      query += " AND phase_id = ?";
      params.push(phaseId);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.query(query, params);
    return res.json({ ok: true, data: rows.map(mapDocument) });
  } catch (err) {
    console.error("Get documents error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function createDocument(req, res) {
  try {
    const {
      id = uid("doc"),
      projectId,
      phaseId = null,
      title,
      fileUrl,
      fileType = "",
      fileSize = 0,
    } = req.body;

    if (!projectId || !title || !fileUrl) {
      return res.status(400).json({ ok: false, error: "projectId, title, and fileUrl are required" });
    }

    const createdAt = new Date();
    await pool.query(
      `INSERT INTO documents (id, project_id, phase_id, title, file_url, file_type, file_size, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, phaseId || null, title, fileUrl, fileType, fileSize, createdAt]
    );

    const [rows] = await pool.query("SELECT * FROM documents WHERE id = ?", [id]);
    return res.status(201).json({ ok: true, data: mapDocument(rows[0]) });
  } catch (err) {
    console.error("Create document error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM documents WHERE id = ?", [id]);
    return res.json({ ok: true, message: "Document deleted" });
  } catch (err) {
    console.error("Delete document error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
