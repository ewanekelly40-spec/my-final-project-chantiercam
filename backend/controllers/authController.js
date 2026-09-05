import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { uid, mapManager, mapProjectUser } from "../utils/helpers.js";
import { generateToken } from "../middlewares/auth.js";

export async function loginManager(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "fillAllFields" });
    }

    const [rows] = await pool.query("SELECT * FROM managers WHERE LOWER(email) = LOWER(?)", [email.trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ ok: false, error: "loginFailed" });
    }

    const manager = rows[0];
    if (manager.suspended) {
      return res.status(403).json({ ok: false, error: "suspended" });
    }

    // Support both bcrypt and direct string match if needed
    let isMatch = false;
    if (manager.password.startsWith("$2a$") || manager.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(password, manager.password);
    } else {
      isMatch = manager.password === password;
    }

    if (!isMatch) {
      return res.status(401).json({ ok: false, error: "loginFailed" });
    }

    const token = generateToken({
      id: manager.id,
      role: "manager",
      email: manager.email,
      name: manager.name,
    });

    const userObj = mapManager(manager);
    return res.json({
      ok: true,
      token,
      user: userObj,
      session: { role: "manager", userId: manager.id },
    });
  } catch (err) {
    console.error("Login manager error:", err);
    return res.status(500).json({ ok: false, error: "serverError", message: err.message });
  }
}

export async function loginProjectUser(req, res) {
  try {
    const { role, email, password } = req.body;
    if (!role || !email || !password) {
      return res.status(400).json({ ok: false, error: "fillAllFields" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM project_users WHERE role = ? AND LOWER(email) = LOWER(?)",
      [role, email.trim()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ ok: false, error: "loginFailed" });
    }

    const user = rows[0];
    if (user.suspended) {
      return res.status(403).json({ ok: false, error: "suspended" });
    }

    let isMatch = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
    }

    if (!isMatch) {
      return res.status(401).json({ ok: false, error: "loginFailed" });
    }

    const token = generateToken({
      id: user.id,
      projectId: user.project_id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    const userObj = mapProjectUser(user);
    return res.json({
      ok: true,
      token,
      user: userObj,
      activeProjectId: user.project_id,
      session: { role: user.role, userId: user.id },
    });
  } catch (err) {
    console.error("Login project user error:", err);
    return res.status(500).json({ ok: false, error: "serverError", message: err.message });
  }
}

export async function signupManager(req, res) {
  try {
    const { name, email, company, phone, password } = req.body;
    if (!name || !email || !company || !password) {
      return res.status(400).json({ ok: false, error: "fillAllFields" });
    }

    const [exists] = await pool.query("SELECT id FROM managers WHERE LOWER(email) = LOWER(?)", [email.trim()]);
    if (exists.length > 0) {
      return res.status(400).json({ ok: false, error: "emailInUse" });
    }

    const id = uid("mgr");
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date();

    await pool.query(
      `INSERT INTO managers (id, role, name, email, password, company, phone, suspended, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, "manager", name, email.trim(), hashedPassword, company, phone || null, false, createdAt]
    );

    const token = generateToken({ id, role: "manager", email: email.trim(), name });
    const userObj = {
      id,
      role: "manager",
      name,
      email: email.trim(),
      company,
      phone: phone || "",
      suspended: false,
      createdAt: createdAt.toISOString(),
    };

    return res.status(201).json({
      ok: true,
      token,
      user: userObj,
      session: { role: "manager", userId: id },
    });
  } catch (err) {
    console.error("Signup manager error:", err);
    return res.status(500).json({ ok: false, error: "serverError", message: err.message });
  }
}

export async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "Not authenticated" });
    }

    const { id, role } = req.user;
    if (role === "manager") {
      const [rows] = await pool.query("SELECT * FROM managers WHERE id = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ ok: false, error: "User not found" });
      return res.json({ ok: true, user: mapManager(rows[0]), session: { role: "manager", userId: id } });
    } else {
      const [rows] = await pool.query("SELECT * FROM project_users WHERE id = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ ok: false, error: "User not found" });
      const user = rows[0];
      return res.json({
        ok: true,
        user: mapProjectUser(user),
        activeProjectId: user.project_id,
        session: { role: user.role, userId: id },
      });
    }
  } catch (err) {
    console.error("Get me error:", err);
    return res.status(500).json({ ok: false, error: "serverError" });
  }
}
