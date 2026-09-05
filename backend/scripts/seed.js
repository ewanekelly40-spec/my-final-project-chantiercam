import bcrypt from "bcryptjs";
import { pool, initDatabase } from "../config/db.js";

export async function seedDatabase(force = false) {
  try {
    await initDatabase();

    const [existingManagers] = await pool.query("SELECT id FROM managers LIMIT 1");
    if (!force && existingManagers.length > 0) {
      console.log("[Seed] Database already contains data. Skipping seed.");
      return;
    }

    console.log("[Seed] Seeding database with demo data...");

    // Clean tables if forcing
    if (force) {
      await pool.query("SET FOREIGN_KEY_CHECKS = 0");
      const tables = [
        "notifications", "messages", "reports", "documents", "progress",
        "payments", "materials", "tasks", "phases", "project_users", "projects", "managers"
      ];
      for (const t of tables) {
        await pool.query(`TRUNCATE TABLE ${t}`);
      }
      await pool.query("SET FOREIGN_KEY_CHECKS = 1");
    }

    const managerId = "user_demo_manager";
    const projectId = "proj_demo_1";
    const workerId = "user_demo_worker";
    const clientId = "user_demo_client";

    const managerHashedPw = await bcrypt.hash("Manager123", 10);
    const workerHashedPw = await bcrypt.hash("Worker123", 10);
    const clientHashedPw = await bcrypt.hash("Client123", 10);

    // 1. Manager
    await pool.query(
      `INSERT INTO managers (id, role, name, email, password, company, phone, suspended, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        managerId,
        "manager",
        "Alain Mbarga",
        "manager@chantiercam.com",
        managerHashedPw,
        "MB Construction SARL",
        "+237 6 90 00 00 01",
        false,
        new Date(Date.now() - 86400000 * 40),
      ]
    );

    // 2. Project
    await pool.query(
      `INSERT INTO projects (id, manager_id, name, location, description, budget, start_date, end_date, status, cover_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        managerId,
        "Résidence Les Palmiers",
        "Bastos, Yaoundé",
        "Construction of a 12-unit residential complex, R+3, including landscaping and parking.",
        85000000,
        new Date(Date.now() - 86400000 * 35).toISOString().slice(0, 10),
        new Date(Date.now() + 86400000 * 150).toISOString().slice(0, 10),
        "ongoing",
        null,
        new Date(Date.now() - 86400000 * 35),
      ]
    );

    // 3. Project Users (Worker and Client)
    await pool.query(
      `INSERT INTO project_users (id, project_id, role, name, email, password, phone, address, id_number, position, emergency_contact, suspended, created_at)
       VALUES 
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        workerId,
        projectId,
        "worker",
        "Jean Fotso",
        "jean.fotso@chantiercam.com",
        workerHashedPw,
        "+237 6 70 11 22 33",
        "Mendong, Yaoundé",
        "112233445566",
        "Mason Foreman",
        "+237 6 99 88 77 66",
        false,
        new Date(Date.now() - 86400000 * 30),

        clientId,
        projectId,
        "client",
        "Sophie Ndjock",
        "sophie.ndjock@chantiercam.com",
        clientHashedPw,
        "+237 6 55 44 33 22",
        "Bastos, Yaoundé",
        "998877665544",
        "Property Owner",
        "+237 6 11 22 33 44",
        false,
        new Date(Date.now() - 86400000 * 34),
      ]
    );

    // 4. Phases
    const phaseFoundationId = "phase_foundation_1";
    const phaseStructureId = "phase_structure_1";
    const phaseRoofingId = "phase_roofing_1";
    const phaseFinishingId = "phase_finishing_1";

    await pool.query(
      `INSERT INTO phases (id, project_id, name, budget, order_index, status, notes, documents, created_at)
       VALUES
       (?, ?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        phaseFoundationId,
        projectId,
        "Fondation",
        15000000,
        1,
        "in_progress",
        "Excavation, semelles et dalle de fondation.",
        JSON.stringify([]),
        new Date(Date.now() - 86400000 * 35),

        phaseStructureId,
        projectId,
        "Élévation / Structure",
        30000000,
        2,
        "not_started",
        "Poteaux, poutres, dalles et maçonnerie.",
        JSON.stringify([]),
        new Date(Date.now() - 86400000 * 35),

        phaseRoofingId,
        projectId,
        "Toiture",
        15000000,
        3,
        "not_started",
        "Charpente et couverture.",
        JSON.stringify([]),
        new Date(Date.now() - 86400000 * 35),

        phaseFinishingId,
        projectId,
        "Finitions",
        25000000,
        4,
        "not_started",
        "Plomberie, électricité, peinture, carrelage.",
        JSON.stringify([]),
        new Date(Date.now() - 86400000 * 35),
      ]
    );

    // 5. Tasks
    await pool.query(
      `INSERT INTO tasks (id, project_id, phase_id, title, description, assigned_to, priority, status, due_date, proposal, proof, history, reminder_sent, created_at, updated_at)
       VALUES
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "task_1",
        projectId,
        phaseFoundationId,
        "Pour concrete foundation - Block A",
        "Pour and level the concrete foundation slab for building block A according to the approved plan.",
        workerId,
        "high",
        "in_progress",
        new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
        "Will need 2 extra bags of cement, starting Monday morning.",
        JSON.stringify([]),
        JSON.stringify([]),
        false,
        new Date(Date.now() - 86400000 * 5),
        new Date(Date.now() - 86400000 * 1),

        "task_2",
        projectId,
        phaseStructureId,
        "Install electrical conduits - Ground floor",
        "Run and secure all electrical conduits for the ground floor before the ceiling is closed.",
        workerId,
        "medium",
        "pending",
        new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
        "",
        JSON.stringify([]),
        JSON.stringify([]),
        false,
        new Date(Date.now() - 86400000 * 2),
        new Date(Date.now() - 86400000 * 2),

        "task_3",
        projectId,
        phaseFoundationId,
        "Site clearing and leveling",
        "Clear remaining debris and level the access road to the site entrance.",
        workerId,
        "low",
        "completed",
        new Date(Date.now() - 86400000 * 10).toISOString().slice(0, 10),
        "Done ahead of schedule.",
        JSON.stringify([]),
        JSON.stringify([]),
        false,
        new Date(Date.now() - 86400000 * 20),
        new Date(Date.now() - 86400000 * 12),
      ]
    );

    // 6. Materials
    await pool.query(
      `INSERT INTO materials (id, project_id, phase_id, name, category, quantity, unit, unit_price, total_price, supplier, purchase_date, notes, created_at)
       VALUES
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "mat_1",
        projectId,
        phaseFoundationId,
        "Cement (CEM I 42.5)",
        "Binders",
        200,
        "bags",
        6000,
        1200000,
        JSON.stringify({ name: "CIMENCAM Distribution", phone: "+237 6 77 12 34 56", address: "Zone Industrielle, Yaoundé" }),
        new Date(Date.now() - 86400000 * 15).toISOString().slice(0, 10),
        "Delivered on site, stored in dry warehouse.",
        new Date(Date.now() - 86400000 * 15),

        "mat_2",
        projectId,
        phaseStructureId,
        "Steel Rebar 12mm",
        "Steel",
        5,
        "tons",
        750000,
        3750000,
        JSON.stringify({ name: "Metal Corp Cameroun", phone: "+237 6 90 44 55 66", address: "Douala - Bonaberi" }),
        new Date(Date.now() - 86400000 * 9).toISOString().slice(0, 10),
        "",
        new Date(Date.now() - 86400000 * 9),
      ]
    );

    // 7. Payments
    await pool.query(
      `INSERT INTO payments (id, project_id, phase_id, user_id, amount, date, mode, type, period, note, created_at)
       VALUES
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "pay_1",
        projectId,
        phaseFoundationId,
        workerId,
        150000,
        new Date(Date.now() - 86400000 * 14).toISOString().slice(0, 10),
        "mobile_money",
        "advance",
        "week",
        "Advance for week 1-2 works.",
        new Date(Date.now() - 86400000 * 14),
      ]
    );

    // 8. Progress
    await pool.query(
      `INSERT INTO progress (id, project_id, phase_id, title, phase, note, media, date, created_at)
       VALUES
       (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "prog_1",
        projectId,
        phaseFoundationId,
        "Foundation excavation complete",
        "Fondation",
        "Excavation finished on all blocks, ready for formwork.",
        JSON.stringify([]),
        new Date(Date.now() - 86400000 * 18).toISOString().slice(0, 10),
        new Date(Date.now() - 86400000 * 18),
      ]
    );

    // 9. Messages
    await pool.query(
      `INSERT INTO messages (id, project_id, from_user, to_user, text, is_read, created_at)
       VALUES
       (?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?)`,
      [
        "msg_1",
        projectId,
        managerId,
        workerId,
        "Good morning Jean, please confirm you'll be on site by 7am tomorrow.",
        true,
        new Date(Date.now() - 86400000 * 1),

        "msg_2",
        projectId,
        workerId,
        managerId,
        "Yes, I'll be there. Bringing the extra team member too.",
        true,
        new Date(Date.now() - 86400000 * 1 + 3600000),

        "msg_3",
        projectId,
        clientId,
        managerId,
        "Hi, do you have new photos of the foundation work?",
        true,
        new Date(Date.now() - 86400000 * 2),
      ]
    );

    // 10. Notifications
    await pool.query(
      `INSERT INTO notifications (id, project_id, user_id, title, message, is_read, created_at)
       VALUES
       (?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?)`,
      [
        "notif_1",
        projectId,
        workerId,
        "New task assigned",
        "You were assigned: Install electrical conduits - Ground floor",
        false,
        new Date(Date.now() - 86400000 * 2),

        "notif_2",
        projectId,
        clientId,
        "Progress update",
        "New update posted: Foundation excavation complete",
        false,
        new Date(Date.now() - 86400000 * 18),
      ]
    );

    console.log("[Seed] Database seeded successfully!");
  } catch (err) {
    console.error("[Seed] Error seeding database:", err);
    throw err;
  }
}

// Direct execution if run from CLI
if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  seedDatabase(true)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
