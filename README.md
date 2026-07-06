<p align="center">
  <img src="https://img.shields.io/badge/MedFlow-AI%20Health%20Platform-0b2240?style=for-the-badge&labelColor=f5a623&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==" alt="MedFlow" />
</p>

<h1 align="center">🏥 MedFlow</h1>

<p align="center">
  <strong>AI-Powered Unified Health Records Management Platform</strong>
  <br />
  <em>Inspired by India's ABDM (Ayushman Bharat Digital Mission) workflows</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-3-000000?style=flat-square&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-Gemini%20%7C%20Groq-8E75B2?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?style=flat-square&logo=vercel&logoColor=white" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-project-structure">Project Structure</a>
</p>

---

## Overview

**MedFlow** is a full-stack health records management platform that demonstrates how AI can digitize, organize, and surface clinical insights from medical documents. It simulates a unified health ecosystem connecting **Citizens**, **Doctors**, and **Government health officials** through a single platform.

Upload a photo of a prescription, lab report, or discharge summary → MedFlow's AI pipeline extracts diagnoses, medications, lab values, and allergies → everything is saved to a structured patient database → doctors get instant clinical summaries → government dashboards show population-level trends.

> **⚠️ Disclaimer**: This is an independent demo project for educational and hackathon purposes. It is **not** affiliated with the official ABDM/NHA. Not intended for real clinical use.

---

## Features

### Citizen Portal
- **Health Profile Dashboard** — View personal health score, active conditions, medications, allergies, and risk indicators
- **Medical Records Vault** — Browse all uploaded records with structured summaries
- **Health Timeline** — Chronological visualization of all medical events
- **QR Health Card** — Generate a scannable QR code that opens a portable, printable patient summary card
- **AI Document Upload** — Upload prescriptions, lab reports, or discharge summaries for automatic extraction
- **Bilingual Support** — Full Hindi (हिंदी) and English interface

### Doctor Console
- **QR/ID Scan** — Scan a patient's Health ID to instantly pull up their complete medical history
- **Clinical Decision Support** — View lab trends, risk indicators, active conditions, and pending follow-ups
- **Digital Consultation** — Record diagnoses, prescriptions, and clinical notes directly into the patient's record

### Government Dashboard
- **District Overview** — Registered citizens, active chronic patients, follow-up compliance rates
- **Disease Surveillance** — Most common diseases, trending conditions, regional heatmaps
- **Medicine Demand Tracking** — Monitor high-demand medications across the population
- **Healthcare Facility Map** — Interactive map of nearby healthcare facilities

### AI Ingestion Pipeline
- **Dual-Path Architecture** — OCR-first (cost-optimized) with Vision LLM fallback
- **Local OCR** — EasyOCR for free, offline text extraction
- **Regex + Medical Dictionary Parser** — Deterministic extraction of lab values, medications, vitals (zero API cost)
- **LLM Enhancement** — Gemini 2.0 Flash or Groq Llama 4 Scout for complex/ambiguous content
- **Multi-Provider Support** — Switch between Gemini and Groq via environment variable
- **Schema Validation** — All extractions validated against a strict medical data schema

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│            React 19 + Vite 8 + Lucide Icons                 │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Citizen   │ │ Doctor   │ │ Govt     │ │ Healthcare    │  │
│  │ Portal    │ │ Console  │ │ Dashboard│ │ Map           │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬───────┘  │
│       └─────────────┴────────────┴───────────────┘          │
│                         │  API Calls                        │
└─────────────────────────┼───────────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │  Flask    │
                    │  REST API │
                    └─────┬─────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
   │  SQLAlchemy │ │  AI Pipeline │ │  Patient    │
   │  + SQLite   │ │  Blueprint   │ │  QR Card    │
   │  Database   │ │              │ │  Generator  │
   └─────────────┘ └──────┬──────┘ └─────────────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
     ┌──────▼──────┐ ┌───▼────┐ ┌──────▼──────┐
     │  EasyOCR    │ │ Regex  │ │  LLM        │
     │  (Local)    │ │ Parser │ │  Gemini/Groq│
     └─────────────┘ └────────┘ └─────────────┘
```

### AI Pipeline Flow

```
Document Upload
      │
      ▼
┌──────────────┐    High         ┌──────────────────┐
│  EasyOCR     │──confidence───▶│  Regex + Medical  │
│  (Free)      │                 │  Dictionary Parse │
└──────┬───────┘                 └────────┬─────────┘
       │ Low/No OCR                       │
       ▼                          All fields resolved?
┌──────────────┐                   │            │
│  Vision LLM  │                  Yes           No
│  (Fallback)  │                   │            │
└──────┬───────┘                   │     ┌──────▼──────┐
       │                           │     │  LLM Text   │
       ▼                           │     │  (1 call)   │
┌──────────────┐                   │     └──────┬──────┘
│  Schema      │◀──────────────────┘            │
│  Validation  │◀───────────────────────────────┘
└──────┬───────┘
       │
       ▼
  Structured JSON → Save to Database
```

---

## Quick Start

### Prerequisites

| Tool       | Version    | Purpose          |
|------------|------------|------------------|
| Python     | 3.9+       | Backend + AI     |
| Node.js    | 18+        | Frontend         |
| npm        | 9+         | Package manager  |

### Option 1: One-Click Start (Windows)

```bash
# Clone the repository
git clone https://github.com/your-username/MedFlow.git
cd MedFlow

# (Optional) Set your AI API key for document upload
set GROQ_API_KEY=your_groq_api_key_here
# OR for Gemini:
# set AI_PROVIDER=gemini
# set GEMINI_API_KEY=your_gemini_api_key_here

# Run the start script
start.bat
```

This automatically:
- Creates a Python virtual environment
- Installs all backend & frontend dependencies
- Seeds the database with sample patient data
- Launches Backend on `http://127.0.0.1:5000`
- Launches Frontend on `http://127.0.0.1:5173`

### Option 2: Manual Setup

#### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt
pip install -r ai/requirements.txt

# (Optional) Set AI provider environment variables
set GROQ_API_KEY=your_key_here

# Run the server
python app.py
```

The backend auto-creates and seeds the SQLite database on first run.

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Option 3: Deploy to Vercel

The project includes `vercel.json` for seamless deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# AI_PROVIDER=groq
# GROQ_API_KEY=your_key
```

---

## Environment Variables

| Variable          | Required | Default  | Description                                     |
|-------------------|----------|----------|-------------------------------------------------|
| `AI_PROVIDER`     | No       | `groq`   | AI provider: `groq` or `gemini`                 |
| `GROQ_API_KEY`    | If Groq  | —        | API key for Groq (Llama 4 Scout)                |
| `GOOGLE_API_KEY`  | If Gemini| —        | API key for Google Gemini                        |
| `GEMINI_API_KEY`  | If Gemini| —        | Alternative Gemini API key variable              |
| `GROQ_MODEL`      | No       | `meta-llama/llama-4-scout-17b-16e-instruct` | Override Groq model |
| `GEMINI_MODEL`    | No       | `gemini-2.0-flash` | Override Gemini model             |

Create a `.env` file in the project root or `backend/` directory:

```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
```

---

## API Reference

### Citizen Endpoints

| Method | Endpoint                                | Description                        |
|--------|------------------------------------------|------------------------------------|
| GET    | `/api/citizens/<health_id>`             | Get citizen profile                |
| GET    | `/api/citizens/<health_id>/records`     | Get medical records                |
| GET    | `/api/citizens/<health_id>/timeline`    | Get health timeline events         |
| GET    | `/api/citizens/<health_id>/analytics`   | Get health analytics & lab trends  |
| GET    | `/api/citizens/<health_id>/followups`   | Get pending follow-ups             |
| POST   | `/api/citizens/<health_id>/records/upload` | Upload & AI-process a medical record |

### Doctor Endpoints

| Method | Endpoint                                | Description                        |
|--------|------------------------------------------|------------------------------------|
| GET    | `/api/doctors/scan/<health_id>`         | Full patient summary for CDS       |
| POST   | `/api/doctors/consultations`            | Record a new consultation          |

### Government Endpoints

| Method | Endpoint                                | Description                        |
|--------|------------------------------------------|------------------------------------|
| GET    | `/api/government/dashboard`             | Population health dashboard        |
| GET    | `/api/government/analytics`             | Disease heatmap analytics          |

### AI Pipeline Endpoint

| Method | Endpoint                                | Description                        |
|--------|------------------------------------------|------------------------------------|
| POST   | `/api/ai/extract`                       | Extract structured data from a medical document (multipart/form-data) |

#### Example: Upload a Medical Document

```bash
curl -X POST http://127.0.0.1:5000/api/ai/extract \
  -F "file=@prescription.jpg"
```

**Response:**
```json
{
  "document_type": "prescription",
  "date": "2025-06-15",
  "hospital_or_clinic": "City General Hospital",
  "doctor_name": "Dr. Sharma",
  "diagnosis": ["Type 2 Diabetes Mellitus"],
  "medications": [
    { "name": "Metformin", "dosage": "500mg", "frequency": "twice daily" }
  ],
  "lab_results": [
    { "test_name": "HbA1c", "value": "7.2", "unit": "%", "flag": "Above Normal" }
  ],
  "allergies": ["Penicillin"],
  "extraction_confidence": "high"
}
```

### Patient QR Card

| Method | Endpoint                                | Description                        |
|--------|------------------------------------------|------------------------------------|
| GET    | `/patient/<health_id>`                  | Renders a printable HTML health card |

---

## Project Structure

```
MedFlow/
├── api/
│   └── index.py                 # Vercel serverless entry point
├── backend/
│   ├── app.py                   # Flask application & REST API routes
│   ├── models.py                # SQLAlchemy database models
│   ├── seed.py                  # Sample data seeder
│   ├── requirements.txt         # Python dependencies
│   ├── medflow.db               # SQLite database (auto-generated)
│   └── ai/
│       ├── __init__.py
│       ├── config.py            # AI provider configuration (Gemini/Groq)
│       ├── pipeline.py          # Main orchestrator (OCR → Parse → LLM → Validate)
│       ├── ocr_engine.py        # EasyOCR wrapper for local text extraction
│       ├── medical_parser.py    # Regex + medical dictionary parser
│       ├── extractor.py         # LLM-based extraction (text & vision)
│       ├── image_utils.py       # File-to-base64 conversion utilities
│       ├── schema.py            # Medical data schema validation
│       ├── context_builder.py   # Patient timeline context builder
│       ├── routes.py            # AI Blueprint (/api/ai/*)
│       └── requirements.txt     # AI-specific dependencies
├── frontend/
│   ├── index.html               # HTML entry point
│   ├── package.json             # Node.js dependencies
│   ├── vite.config.js           # Vite configuration
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Main app with routing & state
│       ├── index.css            # Global styles & design tokens
│       ├── components/
│       │   ├── Header.jsx       # Navigation header with role switcher
│       │   └── ApiLogger.jsx    # API call logger/debugger
│       ├── pages/
│       │   ├── CitizenHome.jsx      # Citizen health profile dashboard
│       │   ├── MedicalRecords.jsx   # Medical records vault
│       │   ├── HealthTimeline.jsx   # Chronological health events
│       │   ├── QRHealthCard.jsx     # QR code health card generator
│       │   ├── UploadRecord.jsx     # AI-powered document upload
│       │   ├── DoctorConsult.jsx    # Doctor consultation console
│       │   ├── GovtDashboard.jsx    # Government analytics dashboard
│       │   └── HealthcareMap.jsx    # Healthcare facility map
│       └── services/
│           └── apiStub.js       # API client / service layer
├── start.bat                    # One-click Windows launcher
├── vercel.json                  # Vercel deployment configuration
├── requirements.txt             # Root-level Python dependencies
└── .gitignore
```

---

## Database Schema

The application uses SQLite with SQLAlchemy ORM. Key models:

| Model            | Purpose                                    |
|------------------|--------------------------------------------|
| `Citizen`        | Patient profile, health score, demographics|
| `Condition`      | Diagnosed medical conditions               |
| `Medication`     | Active/past medications                    |
| `Allergy`        | Known allergies with severity              |
| `MedicalRecord`  | Uploaded documents with structured summaries|
| `TimelineEvent`  | Chronological health events                |
| `Consultation`   | Doctor visit records                       |
| `LabResult`      | Lab test values with trends                |
| `RiskIndicator`  | Clinical risk alerts                       |
| `FollowUp`       | Pending/upcoming follow-up appointments    |

---

## Tech Stack

| Layer     | Technology                                            |
|-----------|-------------------------------------------------------|
| Frontend  | React 19, Vite 8, Lucide React Icons                 |
| Backend   | Python, Flask, Flask-SQLAlchemy, Flask-CORS           |
| Database  | SQLite                                                |
| AI / ML   | EasyOCR, Google Gemini 2.0 Flash, Groq Llama 4 Scout |
| Deployment| Vercel (Serverless Functions + Static Hosting)        |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is open-source and available for educational and demonstration purposes.

---

<p align="center">
  Built with ❤️ for better healthcare accessibility
  <br />
  <strong>MedFlow</strong> — Digitizing health, one record at a time.
</p>
