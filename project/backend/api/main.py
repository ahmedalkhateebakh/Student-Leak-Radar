from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Model registry
# ---------------------------------------------------------------------------

BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_DIR = BACKEND_DIR.parent
MODELS_DIR = BACKEND_DIR / "models"
DATA_DIR_CANDIDATES = [
    PROJECT_DIR / "data" / "raw",
    BACKEND_DIR / "data" / "raw",
]

MODEL_FEATURES = [
    "avg_score_until_cutoff",
    "submitted_assessments_until_cutoff",
    "arab_active_days_equivalent_until_cutoff",
    "avg_submission_delay_arab_days_until_cutoff",
    "homepage",
    "age_band",
    "forumng",
    "unique_sites_until_cutoff",
    "unique_activity_types_until_cutoff",
    "clicks_per_active_day_until_cutoff",
    "resource",
    "subpage",
    "url",
    "oucontent",
    "quiz",
    "highest_education",
    "imd_band",
]

MODEL_FILES = {
    "model_25": "selected_features_of_the_25percent_Early_Warning___Random_Forest.pkl",
    "model_50": "selected_features_of_the_50percent_Early_Warning___Random_Forest.pkl",
}

MODEL_CONFIDENCE = {"model_25": 74, "model_50": 86}

_models: dict = {}
_eda_cache: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    for key, filename in MODEL_FILES.items():
        _models[key] = joblib.load(MODELS_DIR / filename)
    yield


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="Student Leak Radar API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class Features(BaseModel):
    avg_score_until_cutoff: float = 0.0
    submitted_assessments_until_cutoff: float = 0.0
    arab_active_days_equivalent_until_cutoff: float = 0.0
    avg_submission_delay_arab_days_until_cutoff: float = 0.0
    homepage: float = 0.0
    age_band: str = "0-35"
    forumng: float = 0.0
    unique_sites_until_cutoff: float = 0.0
    unique_activity_types_until_cutoff: float = 0.0
    clicks_per_active_day_until_cutoff: float = 0.0
    resource: float = 0.0
    subpage: float = 0.0
    url: float = 0.0
    oucontent: float = 0.0
    quiz: float = 0.0
    highest_education: str = "HE Qualification"
    imd_band: str = "Unknown"


class PredictRequest(BaseModel):
    model: str
    features: Features


class BatchRow(BaseModel):
    id: Optional[str] = None
    features: Features


class BatchRequest(BaseModel):
    model: str
    rows: list[BatchRow]


# ---------------------------------------------------------------------------
# Core prediction logic
# ---------------------------------------------------------------------------

def _run(model_key: str, features: Features) -> dict:
    row = {f: getattr(features, f) for f in MODEL_FEATURES}
    df = pd.DataFrame([row])

    prob = float(_models[model_key].predict_proba(df)[0][1])
    risk_score = round(prob * 100)

    if risk_score >= 70:
        level = "High Risk"
    elif risk_score >= 40:
        level = "Medium Risk"
    else:
        level = "Low Risk"

    return {
        "risk_score": risk_score,
        "level": level,
        "confidence": MODEL_CONFIDENCE[model_key],
        "probability": round(prob, 4),
    }


def _validated(model_key: str) -> None:
    if model_key not in _models:
        raise HTTPException(400, f"Unknown model '{model_key}'. Use: {list(_models)}")


# ---------------------------------------------------------------------------
# EDA helpers
# ---------------------------------------------------------------------------

def _series_to_list(s: pd.Series) -> list[dict]:
    return [{"label": str(k), "count": int(v)} for k, v in s.items()]


def _get_data_dir() -> Path:
    for data_dir in DATA_DIR_CANDIDATES:
        if (data_dir / "studentInfo.csv").exists():
            return data_dir
    return DATA_DIR_CANDIDATES[0]


def _build_eda() -> dict:
    result: dict = {}
    data_dir = _get_data_dir()
    result["data_dir"] = str(data_dir)

    # studentInfo.csv — primary source for most charts
    info_path = data_dir / "studentInfo.csv"
    if not info_path.exists():
        checked = ", ".join(str(path) for path in DATA_DIR_CANDIDATES)
        raise HTTPException(500, f"studentInfo.csv not found in data/raw/. Checked: {checked}")

    info = pd.read_csv(info_path)
    result["total_rows"] = len(info)
    result["unique_students"] = int(info["id_student"].nunique())
    result["modules"] = int(info["code_module"].nunique())
    result["presentations"] = int(info["code_presentation"].nunique())
    result["final_result"] = _series_to_list(info["final_result"].value_counts())
    result["gender"] = _series_to_list(info["gender"].value_counts())
    result["age_band"] = _series_to_list(info["age_band"].value_counts())
    result["highest_education"] = _series_to_list(info["highest_education"].value_counts())
    result["imd_band"] = _series_to_list(info["imd_band"].fillna("Unknown").value_counts())
    result["module"] = _series_to_list(info["code_module"].value_counts())

    # studentAssessment.csv — score distribution
    try:
        assessments = pd.read_csv(data_dir / "studentAssessment.csv")
        scores = assessments["score"].dropna().values
        hist, edges = np.histogram(scores, bins=10, range=(0, 100))
        result["score_bins"] = [
            {"bin": f"{int(edges[i])}-{int(edges[i + 1])}", "count": int(hist[i])}
            for i in range(len(hist))
        ]
    except Exception:
        result["score_bins"] = []

    # vle.csv — activity type catalog (small file, 6k rows)
    try:
        vle = pd.read_csv(data_dir / "vle.csv")
        result["vle_activities"] = _series_to_list(vle["activity_type"].value_counts())
    except Exception:
        result["vle_activities"] = []

    return result


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "models": list(_models)}


@app.post("/predict")
def predict_single(req: PredictRequest):
    _validated(req.model)
    return _run(req.model, req.features)


@app.post("/predict/batch")
def predict_batch(req: BatchRequest):
    _validated(req.model)
    return {
        "results": [
            {"id": row.id or f"Student {i + 1}", **_run(req.model, row.features)}
            for i, row in enumerate(req.rows)
        ]
    }


@app.get("/eda")
def get_eda():
    if not _eda_cache:
        _eda_cache.update(_build_eda())
    return _eda_cache


# ---------------------------------------------------------------------------
# Future endpoints:
#   /explain  — SHAP feature importance per student
#   /students — persist & retrieve student history
#   /report   — generate PDF summary
# ---------------------------------------------------------------------------
