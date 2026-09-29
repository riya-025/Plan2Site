const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

export async function getProjectApi(projectId: number = 1) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch project details");
  return res.json();
}

export async function listProjectsApi() {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects list");
  return res.json();
}

export async function createProjectApi(data: { name: string; project_type: string; location: string; start_date: string }) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function uploadPdfApi(projectId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/projects/${projectId}/upload-pdf`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "PDF upload failed");
  }
  return res.json();
}

export async function getTasksApi(projectId: number = 1) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function submitFieldUpdateApi(data: {
  project_id: number;
  task_id?: number | null;
  reporter_email: string;
  new_status: string;
  reporter_comment: string;
}) {
  const res = await fetch(`${API_BASE}/updates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to submit field update");
  }
  return res.json();
}

export async function getReconciliationsApi(projectId: number = 1) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/reconciliations`);
  if (!res.ok) throw new Error("Failed to fetch reconciliations");
  return res.json();
}

export async function approveReconciliationApi(reconciliation_id: number, action: "APPROVE" | "REJECT") {
  const res = await fetch(`${API_BASE}/reconciliations/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reconciliation_id, action }),
  });
  if (!res.ok) throw new Error("Failed to process approval action");
  return res.json();
}

export async function getAuditTrailApi(projectId: number = 1) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/audit-trail`);
  if (!res.ok) throw new Error("Failed to fetch audit trail");
  return res.json();
}

export function getReportDownloadUrl(projectId: number = 1) {
  return `${API_BASE}/projects/${projectId}/reports/download`;
}

export async function sendNotificationApi(projectId: number, taskId: number, message?: string) {
  const res = await fetch(`${API_BASE}/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id: projectId, task_id: taskId, message }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to send notification");
  }
  return res.json();
}

export async function getNotificationsApi(projectId: number = 1) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/notifications`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function acknowledgeNotificationApi(notificationId: number, ackNotes?: string) {
  const res = await fetch(`${API_BASE}/notifications/acknowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notification_id: notificationId, ack_notes: ackNotes }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to acknowledge notification");
  }
  return res.json();
}

