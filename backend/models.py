from pydantic import BaseModel
from typing import Optional, List

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    email: str
    role: str
    name: str

class ProjectCreateRequest(BaseModel):
    name: str
    project_type: str
    location: str
    start_date: str

class ProjectResponse(BaseModel):
    id: int
    name: str
    project_type: str
    location: str
    start_date: str
    pdf_filename: Optional[str] = None
    created_at: str

class TaskResponse(BaseModel):
    id: int
    project_id: int
    name: str
    description: Optional[str] = None
    planned_start_day: int
    planned_end_day: int
    duration_days: int
    sequence: int
    status: str
    current_progress: float
    schedule_status: str
    lagging_reason: Optional[str] = None

class FieldUpdateCreateRequest(BaseModel):
    project_id: int
    task_id: Optional[int] = None
    reporter_email: str
    new_status: str
    reporter_comment: str

class ReconciliationApprovalRequest(BaseModel):
    reconciliation_id: int
    action: str  # "APPROVE" or "REJECT"

class AuditLogItem(BaseModel):
    id: int
    project_id: int
    timestamp: str
    actor: str
    action: str
    details: str

class NotificationCreateRequest(BaseModel):
    project_id: int
    task_id: int
    message: Optional[str] = None

class NotificationAcknowledgeRequest(BaseModel):
    notification_id: int
    ack_notes: Optional[str] = None

