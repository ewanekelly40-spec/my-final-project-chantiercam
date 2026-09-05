import { pool } from "../config/db.js";
import { uid, mapTask, serializeJsonField } from "../utils/helpers.js";

export async function getTasks(req, res) {
  try {
    const { projectId, assignedTo, status } = req.query;
    let query = "SELECT * FROM tasks WHERE 1=1";
    const params = [];

    if (projectId) {
      query += " AND project_id = ?";
      params.push(projectId);
    }
    if (assignedTo) {
      query += " AND assigned_to = ?";
      params.push(assignedTo);
    }
    if (status && status !== "all") {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY updated_at DESC, created_at DESC";

    const [rows] = await pool.query(query, params);
    return res.json({ ok: true, data: rows.map(mapTask) });
  } catch (err) {
    console.error("Get tasks error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function createTask(req, res) {
  try {
    const {
      id = uid("task"),
      projectId,
      phaseId = null,
      title,
      description = "",
      assignedTo = null,
      priority = "medium",
      status = "pending",
      dueDate = null,
      proposal = "",
      proof = [],
      history = [],
      reminderSent = false,
    } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ ok: false, error: "projectId and title are required" });
    }

    const now = new Date();
    await pool.query(
      `INSERT INTO tasks (id, project_id, phase_id, title, description, assigned_to, priority, status, due_date, proposal, proof, history, reminder_sent, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        phaseId || null,
        title,
        description,
        assignedTo || null,
        priority,
        status,
        dueDate,
        proposal,
        serializeJsonField(proof),
        serializeJsonField(history),
        reminderSent ? 1 : 0,
        now,
        now,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);
    return res.status(201).json({ ok: true, data: mapTask(rows[0]) });
  } catch (err) {
    console.error("Create task error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const {
      phaseId,
      title,
      description,
      assignedTo,
      priority,
      status,
      dueDate,
      proposal,
      proof,
      history,
      reminderSent,
    } = req.body;

    const [existing] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);
    if (existing.length === 0) return res.status(404).json({ ok: false, error: "Task not found" });

    const current = existing[0];
    const updated = {
      phaseId: phaseId !== undefined ? phaseId : current.phase_id,
      title: title !== undefined ? title : current.title,
      description: description !== undefined ? description : current.description,
      assignedTo: assignedTo !== undefined ? assignedTo : current.assigned_to,
      priority: priority !== undefined ? priority : current.priority,
      status: status !== undefined ? status : current.status,
      dueDate: dueDate !== undefined ? dueDate : current.due_date,
      proposal: proposal !== undefined ? proposal : current.proposal,
      proof: proof !== undefined ? serializeJsonField(proof) : current.proof,
      history: history !== undefined ? serializeJsonField(history) : current.history,
      reminderSent: reminderSent !== undefined ? (reminderSent ? 1 : 0) : current.reminder_sent,
    };

    await pool.query(
      `UPDATE tasks
       SET phase_id = ?, title = ?, description = ?, assigned_to = ?, priority = ?, status = ?, due_date = ?, proposal = ?, proof = ?, history = ?, reminder_sent = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        updated.phaseId,
        updated.title,
        updated.description,
        updated.assignedTo,
        updated.priority,
        updated.status,
        updated.dueDate,
        updated.proposal,
        updated.proof,
        updated.history,
        updated.reminderSent,
        id,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);
    return res.json({ ok: true, data: mapTask(rows[0]) });
  } catch (err) {
    console.error("Update task error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
    return res.json({ ok: true, message: "Task deleted" });
  } catch (err) {
    console.error("Delete task error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
