# Plan2Site AI

**Tagline:** *Bridging the gap between planned work and actual site progress.*

SIH Problem Statement: **SIH26122 — Intelligent Data Capture & Schedule-Linking Layer for Infrastructure Project Management: Real-Time Actual Progress Tracking**  
Theme: **Smart Automation**  
Category: **Software**  
Team: **CodeNova**

---

## 🌟 Core Concept & Demo Flow

Plan2Site AI connects planned construction project schedules with real-world field site reports using RAG context retrieval and AI schedule reconciliation.

```
Planner Creates Project ➔ Uploads Plan PDF ➔ AI Extracts Tasks & Gantt Timeline ➔ Site Reporter Updates Progress ➔ AI Reconciles Planned vs Actual ➔ Human Approval ➔ Dashboard Detects Delays
```

---

## 🎨 Color Palette & Design Hierarchy

* **Primary Teal:** `#31AAA9` (Primary buttons, active navigation, progress bars)
* **Secondary Cream:** `#F8E0A4` (Card highlights, scenario badges)
* **Danger / Lagging:** `#A82020` (Lagging status, alerts, warnings)
* **Dark Accent Red:** `#6C1A1A` (Headings, strong accents)

---

## 🚀 Quick Start Guide

### 1. Backend Setup (FastAPI + SQLite + PyMuPDF)

```bash
cd backend
python -m pip install -r requirement.txt
python database.py
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup (Next.js + TypeScript + Tailwind CSS)

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 🔑 Demo Login Credentials

The login screen features 1-click role selection and pre-filled credentials:

* **Project Planner:** `planner@plan2site.demo` | Password: `demo123`
* **Site Reporter:** `reporter@plan2site.demo` | Password: `demo123`

---

## 🧪 3 Pre-configured Demo Scenarios

On the **Site Reporter Updates** page, test the AI engine instantly using the 1-click scenario presets:

1. **Scenario 1 — Clear Match:**  
   * Update: *"Foundation work completed successfully."*  
   * Expected: **MATCH** | **100% Progress** | **ON TIME**
2. **Scenario 2 — Lagging Work:**  
   * Update: *"Brickwork is around 50% complete and work is behind because material arrived late."*  
   * Expected: **MATCH** | **50% Progress** | **LAGGING** (Reason: Material delay)
3. **Scenario 3 — Unclear Update:**  
   * Update: *"Some work was done near the back side of the house."*  
   * Expected: **REVIEW / NO MATCH** | Vague update flag requiring human review.

---

## 🛠️ Architecture & Tech Stack

* **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Lucide React
* **Backend:** Python FastAPI, SQLite3
* **PDF Processing:** PyMuPDF (`fitz`), ReportLab
* **RAG & Vector Embeddings:** SentenceTransformers (`all-MiniLM-L6-v2`) / Cosine Similarity Vector Search
* **AI Engine:** Groq API (`llama-3.3-70b-versatile`) with built-in Smart Local NLP Fallback Engine
