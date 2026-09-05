import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { uid, mapProjectUser, mapManager } from "../utils/helpers.js";

// Project users (Workers and Clients)
export async function getProjectUsers(req, res) {
  try {
    const { projectId, role } = req.query;
    let query = "SELECT * FROM project_users WHERE 1=1";
    const params = [];

    if (projectId) {
      query += " AND project_id = ?";
      params.push(projectId);
    }
    if (role) {
      query += " AND role = ?";
      params.push(role);
    }
    query += " ORDER BY created_at DESC";

    const [rows] = await pool.query(query, params);
    return res.json({ ok: true, data: rows.map(mapProjectUser) });
  } catch (err) {
    console.error("Get project users error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function createProjectUser(req, res) {
  try {
    const {
      id = uid("user"),
      projectId,
      role = "worker",
      name,
      email,
      password,
      phone = "",
      address = "",
      idNumber = "",
      position = "",
      emergencyContact = "",
      suspended = false,
    } = req.body;

    if (!projectId || !name || !email || !password) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    const createdAt = new Date();
    await pool.query(
      `INSERT INTO project_users (id, project_id, role, name, email, password, phone, address, id_number, position, emergency_contact, suspended, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        role,
        name,
        email.trim(),
        password, // Store credentials cleanly for display in credentials card
        phone,
        address,
        idNumber,
        position,
        emergencyContact,
        suspended ? 1 : 0,
        createdAt,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM project_users WHERE id = ?", [id]);
    return res.status(201).json({ ok: true, data: mapProjectUser(rows[0]) });
  } catch (err) {
    console.error("Create project user error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function updateProjectUser(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      phone,
      address,
      idNumber,
      position,
      emergencyContact,
      suspended,
    } = req.body;

    const [existing] = await pool.query("SELECT * FROM project_users WHERE id = ?", [id]);
    if (existing.length === 0) {
      // Check if it's a manager being updated
      const [mgrExisting] = await pool.query("SELECT * FROM managers WHERE id = ?", [id]);
      if (mgrExisting.length > 0) {
        const mgr = mgrExisting[0];
        const updatedName = name !== undefined ? name : mgr.name;
        const updatedEmail = email !== undefined ? email : mgr.email;
        const updatedCompany = req.body.company !== undefined ? req.body.company : mgr.company;
        const updatedPhone = phone !== undefined ? phone : mgr.phone;
        const updatedSuspended = suspended !== undefined ? (suspended ? 1 : 0) : mgr.suspended;

        let updatedPw = mgr.password;
        if (password) {
          updatedPw = await bcrypt.hash(password, 10);
        }

        await pool.query(
          `UPDATE managers SET name = ?, email = ?, company = ?, phone = ?, suspended = ?, password = ? WHERE id = ?`,
          [updatedName, updatedEmail, updatedCompany, updatedPhone, updatedSuspended, updatedPw, id]
        );
        const [updatedMgr] = await pool.query("SELECT * FROM managers WHERE id = ?", [id]);
        return res.json({ ok: true, data: mapManager(updatedMgr[0]) });
      }
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    const current = existing[0];
    const updated = {
      name: name !== undefined ? name : current.name,
      email: email !== undefined ? email.trim() : current.email,
      password: password !== undefined ? password : current.password,
      phone: phone !== undefined ? phone : current.phone,
      address: address !== undefined ? address : current.address,
      idNumber: idNumber !== undefined ? idNumber : current.id_number,
      position: position !== undefined ? position : current.position,
      emergencyContact: emergencyContact !== undefined ? emergencyContact : current.emergency_contact,
      suspended: suspended !== undefined ? (suspended ? 1 : 0) : current.suspended,
    };

    await pool.query(
      `UPDATE project_users
       SET name = ?, email = ?, password = ?, phone = ?, address = ?, id_number = ?, position = ?, emergency_contact = ?, suspended = ?
       WHERE id = ?`,
      [
        updated.name,
        updated.email,
        updated.password,
        updated.phone,
        updated.address,
        updated.idNumber,
        updated.position,
        updated.emergencyContact,
        updated.suspended,
        id,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM project_users WHERE id = ?", [id]);
    return res.json({ ok: true, data: mapProjectUser(rows[0]) });
  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function deleteProjectUser(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM project_users WHERE id = ?", [id]);
    return res.json({ ok: true, message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
