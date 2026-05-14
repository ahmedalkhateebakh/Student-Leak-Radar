# Student Leak Radar

Student Leak Radar is an early-warning student risk dashboard. It uses saved
Random Forest models behind a FastAPI backend and a React/Vite frontend.

## Backend Setup

Use Python 3.11. The saved models require the newer NumPy/scikit-learn versions
pinned in `backend/requirements.txt`.

```powershell
cd project\backend
py -3.11 -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

## Frontend Setup

```powershell
cd project\frontend
npm install
npm run dev
```

The Vite app proxies `/api` requests to `http://localhost:8000`.

## Data Files

The API looks for raw OULAD CSV files in these locations, in order:

1. `project/data/raw`
2. `project/backend/data/raw`

Required for EDA:

- `studentInfo.csv`
- `studentAssessment.csv`

Optional:

- `vle.csv` for activity-type EDA charts

The processing script can also build model-ready features from raw OULAD-like
tables. Its required raw tables are `studentInfo`, `courses`, `studentVle`,
`assessments`, and `studentAssessment`; `vle` is optional and improves
activity-type click features.

## Useful Commands

```powershell
cd project\frontend
npm run lint
npm run build
```

```powershell
cd project\backend
python -m compileall api src
```
