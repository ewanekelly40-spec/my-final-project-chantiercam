import crypto from "crypto";

export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

export function parseJsonField(val, defaultVal = []) {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
}

export function serializeJsonField(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") return val;
  return JSON.stringify(val);
}

// Convert DB snake_case to frontend camelCase
export function mapManager(row) {
  if (!row) return null;
  return {
    id: row.id,
    role: row.role || "manager",
    name: row.name,
    email: row.email,
    company: row.company,
    phone: row.phone,
    suspended: Boolean(row.suspended),
    createdAt: row.created_at,
  };
}

export function mapProject(row) {
  if (!row) return null;
  return {
    id: row.id,
    managerId: row.manager_id,
    name: row.name,
    location: row.location,
    description: row.description,
    budget: Number(row.budget || 0),
    startDate: row.start_date ? new Date(row.start_date).toISOString().slice(0, 10) : null,
    endDate: row.end_date ? new Date(row.end_date).toISOString().slice(0, 10) : null,
    status: row.status || "ongoing",
    cover: row.cover_url,
    createdAt: row.created_at,
  };
}

export function mapProjectUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    role: row.role,
    name: row.name,
    email: row.email,
    password: row.password, // Provided so site manager can display/copy generated credentials in UI
    phone: row.phone,
    address: row.address,
    idNumber: row.id_number,
    position: row.position,
    emergencyContact: row.emergency_contact,
    suspended: Boolean(row.suspended),
    createdAt: row.created_at,
  };
}

export function mapPhase(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    budget: Number(row.budget || 0),
    order: row.order_index,
    status: row.status,
    notes: row.notes,
    documents: parseJsonField(row.documents, []),
    createdAt: row.created_at,
  };
}

export function mapTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    phaseId: row.phase_id,
    title: row.title,
    description: row.description,
    assignedTo: row.assigned_to,
    priority: row.priority || "medium",
    status: row.status || "pending",
    dueDate: row.due_date ? new Date(row.due_date).toISOString().slice(0, 10) : null,
    proposal: row.proposal || "",
    proof: parseJsonField(row.proof, []),
    history: parseJsonField(row.history, []),
    reminderSent: Boolean(row.reminder_sent),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMaterial(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    phaseId: row.phase_id,
    name: row.name,
    category: row.category,
    quantity: Number(row.quantity || 1),
    unit: row.unit,
    unitPrice: Number(row.unit_price || 0),
    totalPrice: Number(row.total_price || 0),
    supplier: parseJsonField(row.supplier, { name: "", phone: "", address: "" }),
    purchaseDate: row.purchase_date ? new Date(row.purchase_date).toISOString().slice(0, 10) : null,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export function mapPayment(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    phaseId: row.phase_id,
    userId: row.user_id,
    amount: Number(row.amount || 0),
    date: row.date ? new Date(row.date).toISOString().slice(0, 10) : null,
    mode: row.mode,
    type: row.type,
    period: row.period,
    note: row.note,
    createdAt: row.created_at,
  };
}

export function mapProgress(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    phaseId: row.phase_id,
    title: row.title,
    phase: row.phase,
    note: row.note,
    media: parseJsonField(row.media, []),
    date: row.date ? new Date(row.date).toISOString().slice(0, 10) : null,
    createdAt: row.created_at,
  };
}

export function mapDocument(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    phaseId: row.phase_id,
    title: row.title,
    fileUrl: row.file_url,
    fileType: row.file_type,
    fileSize: Number(row.file_size || 0),
    createdAt: row.created_at,
  };
}

export function mapReport(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    period: row.period,
    note: row.note,
    data: parseJsonField(row.data, {}),
    createdAt: row.created_at,
  };
}

export function mapMessage(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    from: row.from_user,
    to: row.to_user,
    text: row.text,
    read: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

export function mapNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    read: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}
