import { pool } from "../config/db.js";
import { uid, mapProject } from "../utils/helpers.js";

export async function getProjects(req, res) {
  try {
    const managerId = req.query.managerId || (req.user && req.user.role === "manager" ? req.user.id : null);
    let query = "SELECT * FROM projects";
    const params = [];

    if (managerId) {
      query += " WHERE manager_id = ?";
      params.push(managerId);
    }
    query += " ORDER BY created_at DESC";

    const [rows] = await pool.query(query, params);
    return res.json({ ok: true, data: rows.map(mapProject) });
  } catch (err) {
    console.error("Get projects error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ ok: false, error: "Project not found" });
    return res.json({ ok: true, data: mapProject(rows[0]) });
  } catch (err) {
    console.error("Get project error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function createProject(req, res) {
  try {
    const {
      id = uid("proj"),
      managerId,
      name,
      location = "",
      description = "",
      budget = 0,
      startDate = null,
      endDate = null,
      status = "ongoing",
      cover = null,
    } = req.body;

    const mgrId = managerId || (req.user ? req.user.id : null);
    if (!name || !mgrId) {
      return res.status(400).json({ ok: false, error: "Name and managerId are required" });
    }

    const createdAt = new Date();
    await pool.query(
      `INSERT INTO projects (id, manager_id, name, location, description, budget, start_date, end_date, status, cover_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, mgrId, name, location, description, budget, startDate, endDate, status, cover, createdAt]
    );

    const [rows] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);
    return res.status(201).json({ ok: true, data: mapProject(rows[0]) });
  } catch (err) {
    console.error("Create project error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { name, location, description, budget, startDate, endDate, status, cover } = req.body;

    const [existing] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);
    if (existing.length === 0) return res.status(404).json({ ok: false, error: "Project not found" });

    const current = existing[0];
    const updated = {
      name: name !== undefined ? name : current.name,
      location: location !== undefined ? location : current.location,
      description: description !== undefined ? description : current.description,
      budget: budget !== undefined ? budget : current.budget,
      startDate: startDate !== undefined ? startDate : current.start_date,
      endDate: endDate !== undefined ? endDate : current.end_date,
      status: status !== undefined ? status : current.status,
      cover: cover !== undefined ? cover : current.cover_url,
    };

    await pool.query(
      `UPDATE projects 
       SET name = ?, location = ?, description = ?, budget = ?, start_date = ?, end_date = ?, status = ?, cover_url = ?
       WHERE id = ?`,
      [
        updated.name,
        updated.location,
        updated.description,
        updated.budget,
        updated.startDate,
        updated.endDate,
        updated.status,
        updated.cover,
        id,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);
    return res.json({ ok: true, data: mapProject(rows[0]) });
  } catch (err) {
    console.error("Update project error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM projects WHERE id = ?", [id]);
    return res.json({ ok: true, message: "Project deleted" });
  } catch (err) {
    console.error("Delete project error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
