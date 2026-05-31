# Student Leak Radar

Student Leak Radar is an early-warning dashboard for identifying students who may be at academic risk before the final course outcome. It combines trained machine-learning models, cohort-level analytics, and a React dashboard for single-student review and batch prediction.

Live application: https://student-leak-radar.vercel.app

## What It Does

- Predicts student risk at 25% and 50% course-progress checkpoints.
- Supports single-student prediction from manually entered features.
- Supports batch prediction from one uploaded CSV, Excel, or JSON file.
- Shows clear Low, Medium, and High Risk bands for academic follow-up.
- Provides an Intelligence Lab for outcome distribution, module patterns, demographic context, and dataset readiness.
- Includes CSV requirements and model output pages to make the workflow easier to audit and reuse.

## Why It Matters

Academic risk is often discovered after students have already failed, withdrawn, or disengaged for too long. This project focuses on earlier signals: assessment performance, submission behavior, platform activity, and student profile data. The goal is not to replace academic judgment, but to help instructors and support teams prioritize timely intervention.

## Demo Workflow

1. Open the live dashboard.
2. Go to **Prediction Console**.
3. Choose manual input or upload one cohort file.
4. Select the 25% or 50% Random Forest model.
5. Run prediction and review risk bands, summary charts, and export-ready output.

The Intelligence Lab can also load a backend EDA snapshot automatically when the backend is configured, while still allowing the user to upload one local dataset for exploration.

## Model Inputs

The deployed prediction API expects 17 model-ready features:

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

## Model Performance

| Checkpoint | Model | Accuracy |
|---|---|---:|
| 25% course progress | Random Forest | 80.73% |
| 50% course progress | Random Forest | 86.47% |

## Application Pages

| Page | Route | Purpose |
|---|---|---|
| Home | `/` | Project overview and model context |
| Prediction Console | `/prediction-console` | Manual and batch risk prediction |
| Intelligence Lab | `/intelligence-lab` | Exploratory cohort analytics |
| CSV Requirements | `/csv-requirements` | Upload schema guidance |
| Model Output | `/model-output` | Latest prediction output and export tools |

## Tech Stack

Frontend:

- React
- Vite
- React Router
- Papa Parse
- SheetJS/XLSX
- Plotly.js
- Lucide React

Backend and ML:

- Python 3.11
- FastAPI
- Uvicorn
- Pandas
- NumPy
- scikit-learn
- Joblib
- gdown

## Repository Structure

```text
project/
|-- backend/
|   |-- api/
|   |   |-- main.py
|   |-- src/
|   |   |-- processing.py
|   |-- requirements.txt
|-- frontend/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- HomePage.jsx
|   |   |-- PredictWizard.jsx
|   |   |-- EdaPage.jsx
|   |   |-- CsvRequirementsPage.jsx
|   |   |-- ModelOutputPage.jsx
|   |-- package.json
|   |-- vite.config.js
|-- reports/
|-- poster/
|-- archive/
```

## Local Development

Prerequisites:

- Python 3.11
- Node.js and npm

Start the backend:

```powershell
cd project\backend
py -3.11 -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

Start the frontend:

```powershell
cd project\frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open:

```text
http://127.0.0.1:5173
```

Check the backend:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health
```

Expected response:

```json
{"status":"ok","models":["model_25","model_50"]}
```

## Deployment

The app is deployed as two services:

- Frontend on Vercel
- Backend API on Render

Required frontend environment variable on Vercel:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

Common backend environment variables on Render:

```text
MODEL_25_URL=<google-drive-link-for-random_forest_25.pkl>
MODEL_50_URL=<google-drive-link-for-random_forest_50.pkl>
STUDENT_INFO_URL=<google-drive-link-for-studentInfo.csv>
FRONTEND_ORIGINS=https://student-leak-radar.vercel.app
```

After changing any Vercel environment variable, redeploy the frontend so Vite includes the new value in the production build.

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

## Notes

- Large model files are not intended to be committed to GitHub.
- The backend can download model files from Google Drive when deployment environment variables are configured.
- Batch prediction is designed around a single uploaded dataset to keep the user workflow simple.
