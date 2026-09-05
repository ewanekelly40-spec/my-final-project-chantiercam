import { pool } from "../config/db.js";
import { uid, mapMaterial, serializeJsonField } from "../utils/helpers.js";

export async function getMaterials(req, res) {
  try {
    const { projectId, phaseId } = req.query;
    let query = "SELECT * FROM materials WHERE 1=1";
    const params = [];

    if (projectId) {
      query += " AND project_id = ?";
      params.push(projectId);
    }
    if (phaseId) {
      query += " AND phase_id = ?";
      params.push(phaseId);
    }

    query += " ORDER BY purchase_date DESC, created_at DESC";

    const [rows] = await pool.query(query, params);
    return res.json({ ok: true, data: rows.map(mapMaterial) });
  } catch (err) {
    console.error("Get materials error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function createMaterial(req, res) {
  try {
    const {
      id = uid("mat"),
      projectId,
      phaseId = null,
      name,
      category = "",
      quantity = 1,
      unit = "",
      unitPrice = 0,
      totalPrice = 0,
      supplier = { name: "", phone: "", address: "" },
      purchaseDate = null,
      notes = "",
    } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({ ok: false, error: "projectId and name are required" });
    }

    const calculatedTotal = totalPrice || Number(quantity) * Number(unitPrice);
    const createdAt = new Date();

    await pool.query(
      `INSERT INTO materials (id, project_id, phase_id, name, category, quantity, unit, unit_price, total_price, supplier, purchase_date, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        phaseId || null,
        name,
        category,
        quantity,
        unit,
        unitPrice,
        calculatedTotal,
        serializeJsonField(supplier),
        purchaseDate,
        notes,
        createdAt,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM materials WHERE id = ?", [id]);
    return res.status(201).json({ ok: true, data: mapMaterial(rows[0]) });
  } catch (err) {
    console.error("Create material error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function updateMaterial(req, res) {
  try {
    const { id } = req.params;
    const {
      phaseId,
      name,
      category,
      quantity,
      unit,
      unitPrice,
      totalPrice,
      supplier,
      purchaseDate,
      notes,
    } = req.body;

    const [existing] = await pool.query("SELECT * FROM materials WHERE id = ?", [id]);
    if (existing.length === 0) return res.status(404).json({ ok: false, error: "Material not found" });

    const current = existing[0];
    const newQty = quantity !== undefined ? Number(quantity) : Number(current.quantity);
    const newPrice = unitPrice !== undefined ? Number(unitPrice) : Number(current.unit_price);
    const computedTotal = totalPrice !== undefined ? Number(totalPrice) : newQty * newPrice;

    const updated = {
      phaseId: phaseId !== undefined ? phaseId : current.phase_id,
      name: name !== undefined ? name : current.name,
      category: category !== undefined ? category : current.category,
      quantity: newQty,
      unit: unit !== undefined ? unit : current.unit,
      unitPrice: newPrice,
      totalPrice: computedTotal,
      supplier: supplier !== undefined ? serializeJsonField(supplier) : current.supplier,
      purchaseDate: purchaseDate !== undefined ? purchaseDate : current.purchase_date,
      notes: notes !== undefined ? notes : current.notes,
    };

    await pool.query(
      `UPDATE materials
       SET phase_id = ?, name = ?, category = ?, quantity = ?, unit = ?, unit_price = ?, total_price = ?, supplier = ?, purchase_date = ?, notes = ?
       WHERE id = ?`,
      [
        updated.phaseId,
        updated.name,
        updated.category,
        updated.quantity,
        updated.unit,
        updated.unitPrice,
        updated.totalPrice,
        updated.supplier,
        updated.purchaseDate,
        updated.notes,
        id,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM materials WHERE id = ?", [id]);
    return res.json({ ok: true, data: mapMaterial(rows[0]) });
  } catch (err) {
    console.error("Update material error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function deleteMaterial(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM materials WHERE id = ?", [id]);
    return res.json({ ok: true, message: "Material deleted" });
  } catch (err) {
    console.error("Delete material error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
