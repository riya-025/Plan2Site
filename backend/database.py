import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "plan2site.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL
    )
    """)

    # Projects table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        project_type TEXT NOT NULL,
        location TEXT NOT NULL,
        start_date TEXT NOT NULL,
        pdf_filename TEXT,
        pdf_raw_text TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # Tasks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        planned_start_day INTEGER NOT NULL,
        planned_end_day INTEGER NOT NULL,
        duration_days INTEGER NOT NULL,
        sequence INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'NOT STARTED',
        current_progress REAL NOT NULL DEFAULT 0.0,
        schedule_status TEXT NOT NULL DEFAULT 'ON TIME',
        lagging_reason TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )
    """)

    # PDF Chunks / RAG Context table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pdf_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        chunk_index INTEGER NOT NULL,
        text_content TEXT NOT NULL,
        embedding_json TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )
    """)

    # Field Updates table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS field_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        task_id INTEGER,
        reporter_email TEXT NOT NULL,
        previous_status TEXT,
        new_status TEXT NOT NULL,
        reporter_comment TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )
    """)

    # AI Reconciliations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_reconciliations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        update_id INTEGER NOT NULL,
        project_id INTEGER NOT NULL,
        matched_task_id INTEGER,
        matched_task_name TEXT,
        progress REAL NOT NULL,
        schedule_status TEXT NOT NULL,
        match_confidence TEXT NOT NULL,
        reason TEXT NOT NULL,
        approval_status TEXT NOT NULL DEFAULT 'PENDING',
        created_at TEXT NOT NULL,
        FOREIGN KEY (update_id) REFERENCES field_updates(id),
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )
    """)

    # Audit Trail table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_trail (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )
    """)

    # Notifications table (Planner to Reporter Alerts)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        task_id INTEGER NOT NULL,
        task_name TEXT NOT NULL,
        sender TEXT NOT NULL,
        recipient TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'UNREAD',
        ack_notes TEXT,
        created_at TEXT NOT NULL,
        acknowledged_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
    """)

    # Seed Users
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            "INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)",
            ("planner@plan2site.demo", "demo123", "Project Planner", "Senior Project Planner")
        )
        cursor.execute(
            "INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)",
            ("reporter@plan2site.demo", "demo123", "Site Reporter", "Site Inspector")
        )

    # Seed Initial Project if empty
    cursor.execute("SELECT COUNT(*) FROM projects")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute(
            "INSERT INTO projects (name, project_type, location, start_date, pdf_filename, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            ("My House Project", "Residential Construction", "Pune", "2026-10-01", "sample_house_plan.pdf", now_str)
        )
        project_id = cursor.lastrowid

        default_tasks = [
            ("Site Preparation", "Clear site debris, set up temporary fencing and utility connections.", 1, 2, 2, 1, "COMPLETED", 100.0, "ON TIME", None),
            ("Excavation", "Earthwork excavation for foundations, footing trenches, and soil disposal.", 3, 5, 3, 2, "COMPLETED", 100.0, "ON TIME", None),
            ("Foundation", "Concrete footings, RCC sub-structure, and column starter placement.", 6, 10, 5, 3, "IN PROGRESS", 70.0, "LAGGING", "Concrete pouring pending beyond Day 10 baseline target."),
            ("Columns & Beams", "Erection of RCC columns, beam shuttering, and structural pouring.", 11, 16, 6, 4, "NOT STARTED", 0.0, "ON TIME", None),
            ("Brickwork", "Superstructure AAC brick masonry walls for ground and first floor.", 17, 25, 9, 5, "NOT STARTED", 0.0, "ON TIME", None),
            ("Electrical Work", "Electrical conduit chasing, box embedding, and main wiring layout.", 24, 28, 5, 6, "NOT STARTED", 0.0, "ON TIME", None),
            ("Plumbing Work", "Water supply piping, drainage line installation, and sanitary rough-in.", 26, 30, 5, 7, "NOT STARTED", 0.0, "ON TIME", None),
            ("Plastering", "Internal smooth plaster finish and external weather-proof plastering.", 31, 36, 6, 8, "NOT STARTED", 0.0, "ON TIME", None),
            ("Flooring", "Vitrified tile laying in living rooms and anti-skid tiles in bathrooms.", 37, 42, 6, 9, "NOT STARTED", 0.0, "ON TIME", None),
            ("Painting", "Wall primer, putty application, and final coat acrylic emulsion paint.", 43, 47, 5, 10, "NOT STARTED", 0.0, "ON TIME", None),
            ("Final Inspection", "Quality snag audit, safety clearance, and client key handover.", 48, 50, 3, 11, "NOT STARTED", 0.0, "ON TIME", None),
        ]

        for t in default_tasks:
            cursor.execute(
                """INSERT INTO tasks 
                   (project_id, name, description, planned_start_day, planned_end_day, duration_days, sequence, status, current_progress, schedule_status, lagging_reason)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (project_id, t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9])
            )

        # Pre-seed initial field update & reconciliation for demonstration
        cursor.execute(
            """INSERT INTO field_updates (project_id, task_id, reporter_email, previous_status, new_status, reporter_comment, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (project_id, 3, "reporter@plan2site.demo", "IN PROGRESS", "IN PROGRESS", "Foundation reinforcement is finished but concrete pouring is still remaining.", "10:35 AM")
        )
        update_id = cursor.lastrowid

        cursor.execute(
            """INSERT INTO ai_reconciliations 
               (update_id, project_id, matched_task_id, matched_task_name, progress, schedule_status, match_confidence, reason, approval_status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (update_id, project_id, 3, "Foundation", 70.0, "LAGGING", "MATCH", "Concrete work is still pending beyond the planned completion day (Day 10).", "APPROVED", "10:36 AM")
        )

        # Seed Audit Trail
        audits = [
            ("09:00 AM", "Project Planner", "Created Project", "Project 'My House Project' created with baseline PDF plan."),
            ("09:02 AM", "AI Engine", "Extracted Timeline", "Generated 11 baseline tasks from uploaded PDF schedule."),
            ("10:35 AM", "Site Reporter", "Submitted Field Update", "Task 'Foundation' updated: Foundation reinforcement finished but concrete pouring remaining."),
            ("10:36 AM", "AI Reconciliation Engine", "Matched Update", "Matched update to Foundation task (70% progress, Status: LAGGING)."),
            ("10:40 AM", "Project Planner", "Approved AI Suggestion", "Planner approved reconciliation suggestion for Foundation task.")
        ]
        for a in audits:
            cursor.execute(
                "INSERT INTO audit_trail (project_id, timestamp, actor, action, details) VALUES (?, ?, ?, ?, ?)",
                (project_id, a[0], a[1], a[2], a[3])
            )

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
