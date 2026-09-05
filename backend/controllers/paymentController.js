import { pool } from "../config/db.js";
import { uid, mapPayment } from "../utils/helpers.js";

export async function getPayments(req, res) {
  try {
    const { projectId, phaseId, userId } = req.query;
    let query = "SELECT * FROM payments WHERE 1=1";
    const params = [];

    if (projectId) {
      query += " AND project_id = ?";
      params.push(projectId);
    }
    if (phaseId) {
      query += " AND phase_id = ?";
      params.push(phaseId);
    }
    if (userId) {
      query += " AND user_id = ?";
      params.push(userId);
    }

    query += " ORDER BY date DESC, created_at DESC";

    const [rows] = await pool.query(query, params);
    return res.json({ ok: true, data: rows.map(mapPayment) });
  } catch (err) {
    console.error("Get payments error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function createPayment(req, res) {
  try {
    const {
      id = uid("pay"),
      projectId,
      phaseId = null,
      userId = null,
      amount = 0,
      date = null,
      mode = "cash",
      type = "advance",
      period = "",
      note = "",
    } = req.body;

    if (!projectId || !amount) {
      return res.status(400).json({ ok: false, error: "projectId and amount are required" });
    }

    const createdAt = new Date();
    await pool.query(
      `INSERT INTO payments (id, project_id, phase_id, user_id, amount, date, mode, type, period, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, phaseId || null, userId || null, amount, date, mode, type, period, note, createdAt]
    );

    const [rows] = await pool.query("SELECT * FROM payments WHERE id = ?", [id]);
    return res.status(201).json({ ok: true, data: mapPayment(rows[0]) });
  } catch (err) {
    console.error("Create payment error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function updatePayment(req, res) {
  try {
    const { id } = req.params;
    const { phaseId, userId, amount, date, mode, type, period, note } = req.body;

    const [existing] = await pool.query("SELECT * FROM payments WHERE id = ?", [id]);
    if (existing.length === 0) return res.status(404).json({ ok: false, error: "Payment not found" });

    const current = existing[0];
    const updated = {
      phaseId: phaseId !== undefined ? phaseId : current.phase_id,
      userId: userId !== undefined ? userId : current.user_id,
      amount: amount !== undefined ? amount : current.amount,
      date: date !== undefined ? date : current.date,
      mode: mode !== undefined ? mode : current.mode,
      type: type !== undefined ? type : current.type,
      period: period !== undefined ? period : current.period,
      note: note !== undefined ? note : current.note,
    };

    await pool.query(
      `UPDATE payments
       SET phase_id = ?, user_id = ?, amount = ?, date = ?, mode = ?, type = ?, period = ?, note = ?
       WHERE id = ?`,
      [
        updated.phaseId,
        updated.userId,
        updated.amount,
        updated.date,
        updated.mode,
        updated.type,
        updated.period,
        updated.note,
        id,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM payments WHERE id = ?", [id]);
    return res.json({ ok: true, data: mapPayment(rows[0]) });
  } catch (err) {
    console.error("Update payment error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function deletePayment(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM payments WHERE id = ?", [id]);
    return res.json({ ok: true, message: "Payment deleted" });
  } catch (err) {
    console.error("Delete payment error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
