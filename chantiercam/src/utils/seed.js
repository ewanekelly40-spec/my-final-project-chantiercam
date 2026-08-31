import { uid } from "./helpers";

// Demo dataset so the reviewer can explore the app immediately without
// signing up. All data lives in localStorage and can be wiped from Settings.
export function buildSeed() {
  const managerId = "user_demo_manager";
  const projectId = "proj_demo_1";
  const workerId = "user_demo_worker";
  const clientId = "user_demo_client";

  const managers = [
    {
      id: managerId,
      role: "manager",
      name: "Alain Mbarga",
      email: "manager@chantiercam.com",
      password: "Manager123",
      company: "MB Construction SARL",
      phone: "+237 6 90 00 00 01",
      createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
      suspended: false,
    },
  ];

  const projects = [
    {
      id: projectId,
      managerId,
      name: "Résidence Les Palmiers",
      location: "Bastos, Yaoundé",
      description: "Construction of a 12-unit residential complex, R+3, including landscaping and parking.",
      budget: 85000000,
      startDate: new Date(Date.now() - 86400000 * 35).toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 86400000 * 150).toISOString().slice(0, 10),
      status: "ongoing",
      createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
      cover: null,
    },
  ];

  const projectUsers = [
    {
      id: workerId,
      projectId,
      role: "worker",
      name: "Jean Fotso",
      email: "jean.fotso@chantiercam.com",
      password: "Worker123",
      phone: "+237 6 70 11 22 33",
      address: "Mendong, Yaoundé",
      idNumber: "112233445566",
      position: "Mason Foreman",
      emergencyContact: "+237 6 99 88 77 66",
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      suspended: false,
    },
    {
      id: clientId,
      projectId,
      role: "client",
      name: "Sophie Ndjock",
      email: "sophie.ndjock@chantiercam.com",
      password: "Client123",
      phone: "+237 6 55 44 33 22",
      address: "Bastos, Yaoundé",
      idNumber: "998877665544",
      position: "Property Owner",
      emergencyContact: "+237 6 11 22 33 44",
      createdAt: new Date(Date.now() - 86400000 * 34).toISOString(),
      suspended: false,
    },
  ];

  const phaseFoundationId = uid("phase");
  const phaseStructureId = uid("phase");
  const phaseRoofingId = uid("phase");
  const phaseFinishingId = uid("phase");

  const phases = [
    {
      id: phaseFoundationId,
      projectId,
      name: "Fondation",
      budget: 15000000,
      order: 1,
      status: "in_progress",
      notes: "Excavation, semelles et dalle de fondation.",
      createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
      documents: [],
    },
    {
      id: phaseStructureId,
      projectId,
      name: "Élévation / Structure",
      budget: 30000000,
      order: 2,
      status: "not_started",
      notes: "Poteaux, poutres, dalles et maçonnerie.",
      createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
      documents: [],
    },
    {
      id: phaseRoofingId,
      projectId,
      name: "Toiture",
      budget: 15000000,
      order: 3,
      status: "not_started",
      notes: "Charpente et couverture.",
      createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
      documents: [],
    },
    {
      id: phaseFinishingId,
      projectId,
      name: "Finitions",
      budget: 25000000,
      order: 4,
      status: "not_started",
      notes: "Plomberie, électricité, peinture, carrelage.",
      createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
      documents: [],
    },
  ];

  const tasks = [
    {
      id: uid("task"),
      projectId,
      phaseId: phaseFoundationId,
      title: "Pour concrete foundation - Block A",
      description: "Pour and level the concrete foundation slab for building block A according to the approved plan.",
      assignedTo: workerId,
      priority: "high",
      status: "in_progress",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      proposal: "Will need 2 extra bags of cement, starting Monday morning.",
      proof: [],
      history: [],
      reminderSent: false,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: uid("task"),
      projectId,
      phaseId: phaseStructureId,
      title: "Install electrical conduits - Ground floor",
      description: "Run and secure all electrical conduits for the ground floor before the ceiling is closed.",
      assignedTo: workerId,
      priority: "medium",
      status: "pending",
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      proposal: "",
      proof: [],
      history: [],
      reminderSent: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: uid("task"),
      projectId,
      phaseId: phaseFoundationId,
      title: "Site clearing and leveling",
      description: "Clear remaining debris and level the access road to the site entrance.",
      assignedTo: workerId,
      priority: "low",
      status: "completed",
      dueDate: new Date(Date.now() - 86400000 * 10).toISOString().slice(0, 10),
      proposal: "Done ahead of schedule.",
      proof: [],
      history: [],
      reminderSent: false,
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
  ];

  const materials = [
    {
      id: uid("mat"),
      projectId,
      phaseId: phaseFoundationId,
      name: "Cement (CEM I 42.5)",
      category: "Binders",
      quantity: 200,
      unit: "bags",
      unitPrice: 6000,
      totalPrice: 1200000,
      supplier: { name: "CIMENCAM Distribution", phone: "+237 6 77 12 34 56", address: "Zone Industrielle, Yaoundé" },
      purchaseDate: new Date(Date.now() - 86400000 * 15).toISOString().slice(0, 10),
      notes: "Delivered on site, stored in dry warehouse.",
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    {
      id: uid("mat"),
      projectId,
      phaseId: phaseStructureId,
      name: "Steel Rebar 12mm",
      category: "Steel",
      quantity: 5,
      unit: "tons",
      unitPrice: 750000,
      totalPrice: 3750000,
      supplier: { name: "Metal Corp Cameroun", phone: "+237 6 90 44 55 66", address: "Douala - Bonaberi" },
      purchaseDate: new Date(Date.now() - 86400000 * 9).toISOString().slice(0, 10),
      notes: "",
      createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    },
  ];

  const payments = [
    {
      id: uid("pay"),
      projectId,
      phaseId: phaseFoundationId,
      userId: workerId,
      amount: 150000,
      date: new Date(Date.now() - 86400000 * 14).toISOString().slice(0, 10),
      mode: "mobile_money",
      type: "advance",
      period: "week",
      note: "Advance for week 1-2 works.",
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
  ];

  const progress = [
    {
      id: uid("prog"),
      projectId,
      phaseId: phaseFoundationId,
      title: "Foundation excavation complete",
      phase: "Fondation",
      note: "Excavation finished on all blocks, ready for formwork.",
      media: [],
      date: new Date(Date.now() - 86400000 * 18).toISOString().slice(0, 10),
      createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    },
  ];

  const documents = [];

  const messages = [
    {
      id: uid("msg"),
      projectId,
      from: managerId,
      to: workerId,
      text: "Good morning Jean, please confirm you'll be on site by 7am tomorrow.",
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      read: true,
    },
    {
      id: uid("msg"),
      projectId,
      from: workerId,
      to: managerId,
      text: "Yes, I'll be there. Bringing the extra team member too.",
      createdAt: new Date(Date.now() - 86400000 * 1 + 3600000).toISOString(),
      read: true,
    },
    {
      id: uid("msg"),
      projectId,
      from: clientId,
      to: managerId,
      text: "Hi, do you have new photos of the foundation work?",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      read: true,
    },
  ];

  const notifications = [
    {
      id: uid("notif"),
      projectId,
      userId: workerId,
      title: "New task assigned",
      message: "You were assigned: Install electrical conduits - Ground floor",
      read: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: uid("notif"),
      projectId,
      userId: clientId,
      title: "Progress update",
      message: "New update posted: Foundation excavation complete",
      read: false,
      createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    },
  ];

  return { managers, projects, projectUsers, tasks, materials, payments, progress, messages, notifications, phases, documents, reports: [] };
}

export const PHASE_STATUS = ["not_started", "in_progress", "completed"];
export const SUGGESTED_PHASES = [
  "Fondation", "Élévation / Structure", "Toiture", "Plomberie", "Électricité",
  "Enduits / Crépissage", "Carrelage", "Peinture", "Menuiserie", "Finitions", "Aménagement extérieur",
];

export const SUGGESTED_MATERIALS = [
  { name: "Cement (CEM I 42.5)", category: "Binders", unit: "bags" },
  { name: "Sand", category: "Aggregates", unit: "m³" },
  { name: "Gravel", category: "Aggregates", unit: "m³" },
  { name: "Steel Rebar 12mm", category: "Steel", unit: "tons" },
  { name: "Bricks", category: "Masonry", unit: "pcs" },
  { name: "Wood Planks", category: "Timber", unit: "pcs" },
  { name: "PVC Pipes", category: "Plumbing", unit: "pcs" },
  { name: "Electrical Wire", category: "Electrical", unit: "rolls" },
  { name: "Paint", category: "Finishing", unit: "buckets" },
  { name: "Roofing Sheets", category: "Roofing", unit: "sheets" },
  { name: "Ceramic Tiles", category: "Finishing", unit: "m²" },
  { name: "Glass Panels", category: "Finishing", unit: "pcs" },
];
