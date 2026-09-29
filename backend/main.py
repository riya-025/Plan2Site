import os
import sys
import io
import csv
import json
from datetime import datetime

# Ensure backend directory is in python module path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

from database import get_db, init_db
from models import (
    LoginRequest, UserResponse, ProjectCreateRequest,
    FieldUpdateCreateRequest, ReconciliationApprovalRequest,
    NotificationCreateRequest, NotificationAcknowledgeRequest
)
from pdf_processor import extract_text_from_pdf, chunk_text
from rag_engine import get_embedding
from reconciliation import extract_tasks_from_pdf_content, reconcile_site_update

# Ensure DB is initialized on startup
init_db()

app = FastAPI(title="Plan2Site AI API", version="1.0.0")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "app": "Plan2Site AI Backend", "version": "1.0.0"}

# --- AUTHENTICATION ---
@app.post("/api/auth/login")
def login(req: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT email, role, name FROM users WHERE email = ? AND password = ?", (req.email.strip(), req.password.strip()))
    user = cursor.fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password. Use demo credentials.")
    return {
        "success": True,
        "token": "demo-token-12345",
        "user": {
            "email": user["email"],
            "role": user["role"],
            "name": user["name"]
        }
    }

# --- PROJECTS ---
@app.get("/api/projects")
def list_projects():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects ORDER BY id DESC")
    projects = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"projects": projects}

@app.get("/api/projects/{project_id}")
def get_project(project_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    project = cursor.fetchone()
    if not project:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_dict = dict(project)
    
    # Calculate tasks stats
    cursor.execute("SELECT status, schedule_status, current_progress FROM tasks WHERE project_id = ?", (project_id,))
    tasks = cursor.fetchall()
    conn.close()

    total_tasks = len(tasks)
    completed = sum(1 for t in tasks if t["status"] == "COMPLETED")
    in_progress = sum(1 for t in tasks if t["status"] == "IN PROGRESS")
    not_started = sum(1 for t in tasks if t["status"] == "NOT STARTED")
    on_time = sum(1 for t in tasks if t["schedule_status"] == "ON TIME")
    lagging = sum(1 for t in tasks if t["schedule_status"] == "LAGGING")
    
    overall_progress = round(sum(t["current_progress"] for t in tasks) / total_tasks, 1) if total_tasks > 0 else 0.0

    return {
        "project": project_dict,
        "metrics": {
            "total_tasks": total_tasks,
            "completed": completed,
            "in_progress": in_progress,
            "not_started": not_started,
            "on_time": on_time,
            "lagging": lagging,
            "overall_progress": overall_progress
        }
    }

@app.post("/api/projects")
def create_project(req: ProjectCreateRequest):
    conn = get_db()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        "INSERT INTO projects (name, project_type, location, start_date, created_at) VALUES (?, ?, ?, ?, ?)",
        (req.name.strip(), req.project_type.strip(), req.location.strip(), req.start_date.strip(), now_str)
    )
    project_id = cursor.lastrowid
    
    # Audit entry
    cursor.execute(
        "INSERT INTO audit_trail (project_id, timestamp, actor, action, details) VALUES (?, ?, ?, ?, ?)",
        (project_id, datetime.now().strftime("%I:%M %p"), "Project Planner", "Created Project", f"Project '{req.name}' created.")
    )
    conn.commit()
    conn.close()
    return {"success": True, "project_id": project_id, "message": "Project created successfully."}

@app.post("/api/projects/{project_id}/upload-pdf")
async def upload_project_pdf(project_id: int, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files (.pdf) are supported.")
    
    pdf_bytes = await file.read()
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded PDF file is empty.")

    try:
        raw_text = extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from uploaded PDF. File may be image-only.")

    conn = get_db()
    cursor = conn.cursor()

    # Update project record
    cursor.execute(
        "UPDATE projects SET pdf_filename = ?, pdf_raw_text = ? WHERE id = ?",
        (file.filename, raw_text, project_id)
    )

    # Clean old chunks & tasks if re-uploading
    cursor.execute("DELETE FROM pdf_chunks WHERE project_id = ?", (project_id,))
    cursor.execute("DELETE FROM tasks WHERE project_id = ?", (project_id,))

    # RAG: Chunk text and store embeddings locally
    chunks = chunk_text(raw_text)
    for idx, chunk in enumerate(chunks):
        emb = get_embedding(chunk)
        cursor.execute(
            "INSERT INTO pdf_chunks (project_id, chunk_index, text_content, embedding_json) VALUES (?, ?, ?, ?)",
            (project_id, idx, chunk, json.dumps(emb))
        )

    # AI Task Generation from PDF text
    extracted_tasks = extract_tasks_from_pdf_content(raw_text)

    for t in extracted_tasks:
        cursor.execute(
            """INSERT INTO tasks 
               (project_id, name, description, planned_start_day, planned_end_day, duration_days, sequence, status, current_progress, schedule_status)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'NOT STARTED', 0.0, 'ON TIME')""",
            (
                project_id,
                t.get("name", "Untitled Task"),
                t.get("description", ""),
                t.get("planned_start_day", 1),
                t.get("planned_end_day", 3),
                t.get("duration_days", 3),
                t.get("sequence", 1)
            )
        )

    cursor.execute(
        "INSERT INTO audit_trail (project_id, timestamp, actor, action, details) VALUES (?, ?, ?, ?, ?)",
        (project_id, datetime.now().strftime("%I:%M %p"), "Project Planner", "Uploaded Plan PDF", f"Uploaded baseline PDF '{file.filename}' and generated {len(extracted_tasks)} planned tasks.")
    )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "filename": file.filename,
        "extracted_tasks_count": len(extracted_tasks),
        "tasks": extracted_tasks,
        "message": "PDF uploaded, RAG chunks indexed, and tasks extracted successfully."
    }

# --- TASKS & TIMELINE ---
@app.get("/api/projects/{project_id}/tasks")
def list_project_tasks(project_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks WHERE project_id = ? ORDER BY sequence ASC", (project_id,))
    tasks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"tasks": tasks}

# --- SITE REPORTER UPDATES & AI RECONCILIATION ---
@app.post("/api/updates")
def submit_site_update(req: FieldUpdateCreateRequest):
    conn = get_db()
    cursor = conn.cursor()

    # Get task previous status
    prev_status = "NOT STARTED"
    if req.task_id:
        cursor.execute("SELECT status FROM tasks WHERE id = ?", (req.task_id,))
        task_row = cursor.fetchone()
        if task_row:
            prev_status = task_row["status"]

    now_str = datetime.now().strftime("%I:%M %p")
    cursor.execute(
        """INSERT INTO field_updates 
           (project_id, task_id, reporter_email, previous_status, new_status, reporter_comment, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (req.project_id, req.task_id, req.reporter_email, prev_status, req.new_status, req.reporter_comment.strip(), now_str)
    )
    update_id = cursor.lastrowid

    # Run AI Reconciliation
    reconciliation_result = reconcile_site_update(conn, req.project_id, req.reporter_comment.strip(), req.new_status)

    cursor.execute(
        """INSERT INTO ai_reconciliations 
           (update_id, project_id, matched_task_id, matched_task_name, progress, schedule_status, match_confidence, reason, approval_status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)""",
        (
            update_id,
            req.project_id,
            reconciliation_result["matched_task_id"],
            reconciliation_result["matched_task_name"],
            reconciliation_result["progress"],
            reconciliation_result["schedule_status"],
            reconciliation_result["match_confidence"],
            reconciliation_result["reason"],
            now_str
        )
    )
    reconciliation_id = cursor.lastrowid

    # Immediately update task timeline with actual progress and schedule status
    matched_id = reconciliation_result["matched_task_id"] or req.task_id
    if matched_id:
        prog = reconciliation_result["progress"]
        if req.new_status == "COMPLETED":
            prog = 100.0
            new_task_status = "COMPLETED"
        elif req.new_status == "NOT STARTED":
            prog = 0.0
            new_task_status = "NOT STARTED"
        else:
            new_task_status = "COMPLETED" if prog >= 100.0 else "IN PROGRESS"

        sched_status = reconciliation_result["schedule_status"]
        reason = reconciliation_result["reason"]

        cursor.execute(
            """UPDATE tasks 
               SET status = ?, current_progress = ?, schedule_status = ?, lagging_reason = ? 
               WHERE id = ?""",
            (
                new_task_status,
                prog,
                sched_status,
                reason if sched_status == "LAGGING" else None,
                matched_id
            )
        )

    # Log audit
    cursor.execute(
        "INSERT INTO audit_trail (project_id, timestamp, actor, action, details) VALUES (?, ?, ?, ?, ?)",
        (req.project_id, now_str, "Site Reporter", "Submitted Field Update", f"Reported '{req.new_status}' for {reconciliation_result['matched_task_name']}: {req.reporter_comment[:60]}")
    )
    cursor.execute(
        "INSERT INTO audit_trail (project_id, timestamp, actor, action, details) VALUES (?, ?, ?, ?, ?)",
        (req.project_id, now_str, "AI Reconciliation Engine", "Updated Project Timeline", f"Timeline updated: '{reconciliation_result['matched_task_name']}' set to {reconciliation_result['progress']:.0f}% progress, Schedule: {reconciliation_result['schedule_status']}.")
    )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "update_id": update_id,
        "reconciliation_id": reconciliation_id,
        "ai_recommendation": reconciliation_result
    }

@app.get("/api/projects/{project_id}/reconciliations")
def list_reconciliations(project_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT r.*, u.reporter_comment, u.reporter_email, u.new_status as reported_status, u.task_id as direct_task_id
           FROM ai_reconciliations r
           JOIN field_updates u ON r.update_id = u.id
           WHERE r.project_id = ?
           ORDER BY r.id DESC""",
        (project_id,)
    )
    reconciliations = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"reconciliations": reconciliations}

# --- HUMAN-IN-THE-LOOP APPROVAL ---
@app.post("/api/reconciliations/approve")
def approve_or_reject_reconciliation(req: ReconciliationApprovalRequest):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        """SELECT r.*, u.new_status as reported_status, u.task_id as direct_task_id
           FROM ai_reconciliations r
           JOIN field_updates u ON r.update_id = u.id
           WHERE r.id = ?""",
        (req.reconciliation_id,)
    )
    rec = cursor.fetchone()
    if not rec:
        conn.close()
        raise HTTPException(status_code=404, detail="Reconciliation record not found")

    now_str = datetime.now().strftime("%I:%M %p")

    if req.action.upper() == "APPROVE":
        cursor.execute("UPDATE ai_reconciliations SET approval_status = 'APPROVED' WHERE id = ?", (req.reconciliation_id,))
        
        target_task_id = rec["matched_task_id"] or rec["direct_task_id"]
        if target_task_id:
            reported_st = rec["reported_status"]
            prog = rec["progress"]

            if reported_st == "COMPLETED" or prog >= 100.0:
                final_status = "COMPLETED"
                final_progress = 100.0
            elif reported_st == "NOT STARTED":
                final_status = "NOT STARTED"
                final_progress = 0.0
            else:
                final_status = "IN PROGRESS"
                final_progress = prog if prog > 0.0 else 50.0

            cursor.execute(
                """UPDATE tasks 
                   SET status = ?, current_progress = ?, schedule_status = ?, lagging_reason = ? 
                   WHERE id = ?""",
                (
                    final_status,
                    final_progress,
                    rec["schedule_status"],
                    rec["reason"] if rec["schedule_status"] == "LAGGING" else None,
                    target_task_id
                )
            )

        cursor.execute(
            "INSERT INTO audit_trail (project_id, timestamp, actor, action, details) VALUES (?, ?, ?, ?, ?)",
            (rec["project_id"], now_str, "Project Planner", "Approved AI Suggestion", f"Approved recommendation for '{rec['matched_task_name']}' ({rec['progress']:.0f}%, {rec['schedule_status']}).")
        )
    else:
        cursor.execute("UPDATE ai_reconciliations SET approval_status = 'REJECTED' WHERE id = ?", (req.reconciliation_id,))
        cursor.execute(
            "INSERT INTO audit_trail (project_id, timestamp, actor, action, details) VALUES (?, ?, ?, ?, ?)",
            (rec["project_id"], now_str, "Project Planner", "Rejected AI Suggestion", f"Rejected recommendation for '{rec['matched_task_name']}'.")
        )

    conn.commit()
    conn.close()

    return {"success": True, "action": req.action.upper(), "message": f"AI recommendation {req.action.lower()}d successfully."}

# --- AUDIT TRAIL ---
@app.get("/api/projects/{project_id}/audit-trail")
def get_audit_trail(project_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_trail WHERE project_id = ? ORDER BY id DESC", (project_id,))
    logs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"audit_trail": logs}

# --- REPORTS DOWNLOAD ---
@app.get("/api/projects/{project_id}/reports/download")
def download_project_report(project_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    project = cursor.fetchone()
    if not project:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    cursor.execute("SELECT * FROM tasks WHERE project_id = ? ORDER BY sequence ASC", (project_id,))
    tasks = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write Header Metadata
    writer.writerow(["PLAN2SITE AI - PROJECT RECONCILIATION REPORT"])
    writer.writerow(["Project Name", project["name"]])
    writer.writerow(["Project Type", project["project_type"]])
    writer.writerow(["Location", project["location"]])
    writer.writerow(["Generated At", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
    writer.writerow([])

    # Table Headers
    writer.writerow(["Seq", "Task Name", "Description", "Planned Start", "Planned End", "Duration", "Status", "Progress (%)", "Schedule Status", "Lagging Reason"])

    for t in tasks:
        writer.writerow([
            t["sequence"],
            t["name"],
            t["description"],
            f"Day {t['planned_start_day']}",
            f"Day {t['planned_end_day']}",
            f"{t['duration_days']} Days",
            t["status"],
            f"{t['current_progress']:.0f}%",
            t["schedule_status"],
            t["lagging_reason"] or "N/A"
        ])

    output.seek(0)
    filename = f"Plan2Site_Report_Project_{project_id}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# --- PLANNER TO REPORTER NOTIFICATIONS ---
@app.post("/api/notifications")
def send_notification(req: NotificationCreateRequest):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT name, schedule_status, lagging_reason FROM tasks WHERE id = ?", (req.task_id,))
    task = cursor.fetchone()
    if not task:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")

    task_name = task["name"]
    msg = req.message or f"URGENT: Activity '{task_name}' is currently LAGGING behind planned schedule. Please expedite site execution and submit an update."

    now_str = datetime.now().strftime("%I:%M %p")
    cursor.execute(
        """INSERT INTO notifications 
           (project_id, task_id, task_name, sender, recipient, message, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 'UNREAD', ?)""",
        (req.project_id, req.task_id, task_name, "Project Planner", "reporter@plan2site.demo", msg.strip(), now_str)
    )
    notif_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO audit_trail (project_id, timestamp, actor, action, details) VALUES (?, ?, ?, ?, ?)",
        (req.project_id, now_str, "Project Planner", "Sent Lagging Task Alert", f"Sent urgent notification for lagging task '{task_name}' to Site Reporter.")
    )

    conn.commit()
    conn.close()

    return {"success": True, "notification_id": notif_id, "message": "Notification sent to Site Reporter successfully."}

@app.get("/api/projects/{project_id}/notifications")
def get_notifications(project_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notifications WHERE project_id = ? ORDER BY id DESC", (project_id,))
    notifs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"notifications": notifs}

@app.post("/api/notifications/acknowledge")
def acknowledge_notification(req: NotificationAcknowledgeRequest):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM notifications WHERE id = ?", (req.notification_id,))
    notif = cursor.fetchone()
    if not notif:
        conn.close()
        raise HTTPException(status_code=404, detail="Notification not found")

    now_str = datetime.now().strftime("%I:%M %p")
    ack_text = req.ack_notes or "Site Reporter acknowledged lagging schedule alert."

    cursor.execute(
        "UPDATE notifications SET status = 'ACKNOWLEDGED', ack_notes = ?, acknowledged_at = ? WHERE id = ?",
        (ack_text, now_str, req.notification_id)
    )

    cursor.execute(
        "INSERT INTO audit_trail (project_id, timestamp, actor, action, details) VALUES (?, ?, ?, ?, ?)",
        (notif["project_id"], now_str, "Site Reporter", "Acknowledged Alert", f"Acknowledged lagging alert for '{notif['task_name']}': {ack_text[:50]}")
    )

    conn.commit()
    conn.close()

    return {"success": True, "message": "Notification acknowledged successfully."}

