# Student Leak Radar

Student Leak Radar is an AI-powered early-warning dashboard for identifying students who may be at academic risk before the final course outcome is visible. The project combines trained machine-learning models, FastAPI inference services, and a polished React dashboard for student-risk scoring, cohort analysis, CSV validation, and export-ready prediction outputs.

The system is designed around a practical education analytics workflow: prepare student learning data, score risk at early checkpoints, inspect cohort behavior, and prioritize intervention for students who need support.

## Table of Contents

- [Overview](#overview)
- [Core Capabilities](#core-capabilities)
- [System Architecture](#system-architecture)
- [Application Pages](#application-pages)
- [Machine Learning Models](#machine-learning-models)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Manual Setup](#manual-setup)
- [API Reference](#api-reference)
- [Data Requirements](#data-requirements)
- [Feature Engineering Utility](#feature-engineering-utility)
- [Quality Checks](#quality-checks)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)
- [Team](#team)
- [License](#license)

## Overview

Student Leak Radar helps instructors, academic reviewers, and education teams detect early signs of failure or withdrawal risk. It uses learning-platform activity, assessment behavior, submission timing, and profile context to generate a risk score and risk band.

The product includes:

- A production-style React/Vite dashboard.
- A FastAPI backend serving saved Random Forest model pipelines.
- Single-student and batch prediction workflows.
- Cohort-level analytics and EDA views.
- CSV requirement documentation and export-ready output pages.
- A feature-engineering script for OULAD-like raw tables and model-ready datasets.

## Core Capabilities

- Early risk prediction at 25% and 50% course progress checkpoints.
- Single-student scoring through a guided prediction console.
- Batch cohort upload for intervention queue building.
- Risk bands: Low Risk, Medium Risk, and High Risk.
- Average risk score and cohort distribution visualizations.
- Intelligence Lab for demographic, assessment, activity, and readiness analysis.
- CSV contract views for prediction and analytics datasets.
- Exportable prediction outputs for downstream review.
- FastAPI endpoints for health checks, single prediction, batch prediction, and EDA data.

## System Architecture

```text
Student Leak Radar
|
|-- Frontend: React + Vite
|   |-- Home
|   |-- Prediction Console
|   |-- Intelligence Lab
|   |-- CSV Requirements
|   |-- Model Output
|
|-- Backend: FastAPI
|   |-- /health
|   |-- /predict
|   |-- /predict/batch
|   |-- /eda
|
|-- ML Layer
|   |-- 25% Early Warning Random Forest model
|   |-- 50% Early Warning Random Forest model
|   |-- 17 selected model features
|
|-- Data Layer
|   |-- OULAD-like raw CSV tables
|   |-- Feature-ready prediction CSV files
|   |-- Saved model artifacts
```

## Application Pages

| Page | Route | Purpose |
| --- | --- | --- |
| Home | `/` | Project story, goals, model context, and team profile |
| Prediction Console | `/prediction-console` | Single-student and batch model scoring |
| Intelligence Lab | `/intelligence-lab` | Cohort EDA, behavior analysis, and dataset readiness |
| CSV Requirements | `/csv-requirements` | Required column contracts for uploads |
| Model Output | `/model-output` | Latest prediction outputs and export workflow |

## Machine Learning Models

The backend loads saved scikit-learn compatible model pipelines from `backend/models`.

Required model files:

```text
backend/models/
|-- selected_features_of_the_25percent_Early_Warning___Random_Forest.pkl
|-- selected_features_of_the_50percent_Early_Warning___Random_Forest.pkl
```

Available model keys:

| Model key | Checkpoint | Model type | Confidence label |
| --- | --- | --- | --- |
| `model_25` | 25% course progress | Random Forest | 74 |
| `model_50` | 50% course progress | Random Forest | 86 |

Risk scoring:

| Risk score | Risk band |
| --- | --- |
| `0-39` | Low Risk |
| `40-69` | Medium Risk |
| `70-100` | High Risk |

The current API expects 17 selected features:

```text
avg_score_until_cutoff
submitted_assessments_until_cutoff
arab_active_days_equivalent_until_cutoff
avg_submission_delay_arab_days_until_cutoff
homepage
age_band
forumng
unique_sites_until_cutoff
unique_activity_types_until_cutoff
clicks_per_active_day_until_cutoff
resource
subpage
url
oucontent
quiz
highest_education
imd_band
```

## Tech Stack

Frontend:

- React
- Vite
- React Router
- Plotly.js
- Papa Parse
- SheetJS/XLSX
- Lucide React
- Tailwind CSS plugin

Backend and ML:

- Python 3.11
- FastAPI
- Uvicorn
- NumPy
- Pandas
- scikit-learn 1.8.0
- XGBoost
- Joblib
- OpenPyXL

## Project Structure

```text
project/
|-- README.md
|-- start-backend.ps1
|-- backend/
|   |-- api/
|   |   |-- main.py
|   |-- src/
|   |   |-- processing.py
|   |-- requirements.txt
|   |-- models/
|   |-- notebooks/
|-- frontend/
|   |-- package.json
|   |-- vite.config.js
|   |-- vercel.json
|   |-- nginx.conf
|   |-- public/
|   |-- src/
|       |-- HomePage.jsx
|       |-- PredictWizard.jsx
|       |-- EdaPage.jsx
|       |-- CsvRequirementsPage.jsx
|       |-- ModelOutputPage.jsx
|       |-- routeConfig.js
|       |-- dataGuides.js
|-- reports/
|-- poster/
|-- archive/
```

## Quick Start

Prerequisites:

- Python 3.11
- Node.js and npm
- Saved model files in `backend/models`

Run the backend in one terminal:

```powershell
cd project
.\start-backend.ps1
```

Run the frontend in another terminal:

```powershell
cd project\frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open the application:

```text
http://127.0.0.1:5173
```

Verify the backend:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health
```

Expected response:

```json
{"status":"ok","models":["model_25","model_50"]}
```

## Manual Setup

Backend setup:

```powershell
cd project\backend
py -3.11 -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend setup:

```powershell
cd project\frontend
npm install
npm run dev
```

The Vite development server proxies `/api` requests to:

```text
http://127.0.0.1:8000
```

## API Reference

Base URL:

```text
http://127.0.0.1:8000
```

### `GET /health`

Returns backend status and loaded model keys.

Example response:

```json
{
  "status": "ok",
  "models": ["model_25", "model_50"]
}
```

### `POST /predict`

Runs a single-student prediction.

Example request:

```json
{
  "model": "model_25",
  "features": {
    "avg_score_until_cutoff": 72.5,
    "submitted_assessments_until_cutoff": 3,
    "arab_active_days_equivalent_until_cutoff": 21,
    "avg_submission_delay_arab_days_until_cutoff": 1.5,
    "homepage": 80,
    "age_band": "0-35",
    "forumng": 24,
    "unique_sites_until_cutoff": 18,
    "unique_activity_types_until_cutoff": 5,
    "clicks_per_active_day_until_cutoff": 12.4,
    "resource": 44,
    "subpage": 12,
    "url": 5,
    "oucontent": 18,
    "quiz": 3,
    "highest_education": "HE Qualification",
    "imd_band": "20-30%"
  }
}
```

Example response:

```json
{
  "risk_score": 62,
  "level": "Medium Risk",
  "confidence": 74,
  "probability": 0.62
}
```

### `POST /predict/batch`

Runs prediction for multiple rows.

Request shape:

```json
{
  "model": "model_50",
  "rows": [
    {
      "id": "Student 001",
      "features": {
        "avg_score_until_cutoff": 70
      }
    }
  ]
}
```

Any missing feature uses the backend schema default.

### `GET /eda`

Returns summary statistics and chart-ready data from raw OULAD CSV files when available.

The endpoint looks for data in:

1. `project/data/raw`
2. `project/backend/data/raw`

## Data Requirements

### Prediction Console

For model-ready prediction uploads, provide the 17 model features listed in [Machine Learning Models](#machine-learning-models). The optional `id` column can be included for display and export.

### Intelligence Lab

Recommended columns for broader EDA include:

```text
code_module
code_presentation
id_student
gender
highest_education
imd_band
age_band
final_result
target
total_clicks
total_active_days
unique_sites
unique_activity_types
avg_score
submitted_assessments
avg_submission_delay
avg_submission_delay_arab_days
```

### Raw OULAD Data

For backend EDA and feature engineering, place raw CSV files in one of these folders:

```text
project/data/raw
project/backend/data/raw
```

Required for EDA:

```text
studentInfo.csv
studentAssessment.csv
```

Optional for EDA:

```text
vle.csv
```

Required for full feature engineering:

```text
studentInfo.csv
courses.csv
studentVle.csv
assessments.csv
studentAssessment.csv
```

Optional:

```text
vle.csv
```

## Feature Engineering Utility

The backend includes `backend/src/processing.py`, a standalone utility for preparing OULAD-like records for the selected early-warning feature set.

Supported input formats:

- Folder of CSV files
- JSON file with table keys
- XLSX workbook with matching sheet names
- SQLite database with matching table names
- A single feature-ready CSV/JSON/XLSX/DB table

Preview model-ready features:

```powershell
cd project\backend
python src\processing.py ..\data\raw --cutoff 0.50
```

Run prediction with a saved model:

```powershell
cd project\backend
python src\processing.py ..\data\raw --model models\selected_features_of_the_50percent_Early_Warning___Random_Forest.pkl --output predictions.csv
```

Manual input mode:

```powershell
cd project\backend
python src\processing.py --manual --model models\selected_features_of_the_50percent_Early_Warning___Random_Forest.pkl
```

## Quality Checks

Frontend:

```powershell
cd project\frontend
npm run lint
npm run build
```

Backend:

```powershell
cd project\backend
python -m compileall api src
```

Backend service check:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health
```

## Deployment Notes

The frontend is configured as a single-page application.

Included routing support:

- `frontend/vercel.json` for Vercel rewrites.
- `frontend/public/_redirects` for Netlify-style hosting.
- `frontend/public/.htaccess` for Apache hosting.
- `frontend/nginx.conf` snippet for Nginx `try_files` routing.

For production, configure the frontend API base URL using:

```text
VITE_API_BASE_URL
```

If not set, the frontend uses `/api` during development through the Vite proxy and falls back to `http://127.0.0.1:8000` in the prediction workflow.

## Troubleshooting

### Backend does not start

Check that:

- Python 3.11 is installed.
- Backend dependencies are installed from `backend/requirements.txt`.
- Model artifacts exist in `backend/models`.
- Port `8000` is available.

### Frontend cannot call the API

Check that:

- FastAPI is running on `http://127.0.0.1:8000`.
- Vite is running on `http://127.0.0.1:5173`.
- The Vite proxy is active in `frontend/vite.config.js`.

### `/eda` returns missing data errors

Add the required raw CSV files to either:

```text
project/data/raw
project/backend/data/raw
```

At minimum, EDA expects:

```text
studentInfo.csv
studentAssessment.csv
```

### Saved models fail to load

The saved pipelines require compatible NumPy and scikit-learn versions. Use the pinned backend environment:

```powershell
pip install -r backend\requirements.txt
```

## Team

Fares Alnamla:

- AI Engineer | ML Specialist | NLP
- Machine Learning, NLP, RAG Systems, Predictive Analytics, FastAPI
- GitHub: `https://github.com/FaresAlnamla`
- LinkedIn: `https://www.linkedin.com/in/faresalnamla-ai-engineer-ml-nlp`

Ahmed Alkhateeb:

- Data Scientist | NLP Specialist
- Natural Language Processing, RAG Systems, LLM Applications, Predictive Analytics, FastAPI
- GitHub: `https://github.com/ahmedalkhateebakh`
- LinkedIn: `https://www.linkedin.com/in/ahmedai`

## License

This repository is intended for academic, portfolio, and applied machine-learning demonstration purposes. Add a formal license file before publishing or distributing the project publicly.
