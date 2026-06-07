import gc
import os
from pathlib import Path
import shutil
import tempfile
import threading
from typing import Optional
import zipfile

import gdown
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

EDA_ARCHIVE_URL_ENVS = ("EDA_DATA_URL", "RAW_DATA_URL", "OULAD_DATA_URL")
EDA_FILE_URL_ENVS = {
    "studentInfo.csv": ("STUDENT_INFO_URL", "DATA_STUDENT_INFO_URL"),
    "studentAssessment.csv": ("STUDENT_ASSESSMENT_URL", "DATA_STUDENT_ASSESSMENT_URL"),
    "vle.csv": ("VLE_URL", "DATA_VLE_URL"),
}
EDA_FILE_DEFAULT_URLS = {
    "studentInfo.csv": "https://drive.google.com/file/d/127Of2eBe2bihM5GuI7bM921G3lingjaR/view?usp=sharing",
}
EDA_KNOWN_FILES = tuple(EDA_FILE_URL_ENVS)

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
    "model_25": "random_forest_25.pkl",
    "model_50": "random_forest_50.pkl",
}

MODEL_URL_ENVS = {
    "model_25": "MODEL_25_URL",
    "model_50": "MODEL_50_URL",
}

MODEL_DEFAULT_URLS = {
    "model_50": "https://drive.google.com/file/d/1Nrz2Qqintjpl9rKqnQGBAhuDToiwmY44/view?usp=sharing",
}

MODEL_CONFIDENCE = {"model_25": 74, "model_50": 86}

_eda_cache: dict = {}
_model_cache: dict = {"key": None, "model": None}
_model_lock = threading.Lock()


def _csv_env(name: str) -> list[str]:
    return [item.strip() for item in os.getenv(name, "").split(",") if item.strip()]


def _first_env(names: tuple[str, ...]) -> tuple[str, str]:
    for name in names:
        value = os.getenv(name, "").strip()
        if value:
            return name, value
    return "", ""


def _model_url(model_key: str) -> tuple[str, str]:
    env_name = MODEL_URL_ENVS[model_key]
    url = os.getenv(env_name, "").strip()
    if url:
        return env_name, url
    default_url = MODEL_DEFAULT_URLS.get(model_key, "")
    if default_url:
        return "built-in default", default_url
    return "", ""


def _ensure_model_file(model_key: str, filename: str) -> Optional[Path]:
    model_path = MODELS_DIR / filename
    if model_path.exists():
        return model_path

    url_source, url = _model_url(model_key)
    if not url:
        print(f"Skipping {model_key}: {filename} not found and {MODEL_URL_ENVS[model_key]} is not set.")
        return None

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {model_key} from Google Drive to {model_path}...")
    try:
        gdown.download(url=url, output=str(model_path), quiet=False, fuzzy=True)
    except Exception as exc:
        if model_path.exists():
            model_path.unlink()
        raise RuntimeError(f"Could not download {model_key} from {url_source}") from exc

    if not model_path.exists() or model_path.stat().st_size == 0:
        raise RuntimeError(f"Downloaded model file is missing or empty: {model_path}")

    return model_path


def _configured_models() -> list[str]:
    models = []
    for key, filename in MODEL_FILES.items():
        has_local_file = (MODELS_DIR / filename).exists()
        has_remote_url = bool(_model_url(key)[1])
        if has_local_file or has_remote_url:
            models.append(key)
    return models


def _load_model(model_key: str):
    with _model_lock:
        if _model_cache["key"] == model_key and _model_cache["model"] is not None:
            return _model_cache["model"]

        if _model_cache["model"] is not None:
            print(f"Unloading {_model_cache['key']} before loading {model_key}.")
            _model_cache["key"] = None
            _model_cache["model"] = None
            gc.collect()

        model_path = _ensure_model_file(model_key, MODEL_FILES[model_key])
        if not model_path:
            raise RuntimeError(f"Model '{model_key}' is not configured.")
        print(f"Loading {model_key}: {model_path.name}")
        model = joblib.load(model_path, mmap_mode="r")
        _model_cache["key"] = model_key
        _model_cache["model"] = model
        return model


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="Student Leak Radar API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        *_csv_env("FRONTEND_ORIGINS"),
    ],
    allow_origin_regex=os.getenv(
        "CORS_ALLOW_ORIGIN_REGEX",
        r"^(http://(localhost|127\.0\.0\.1):\d+|https://.*\.vercel\.app)$",
    ),
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

    model = _load_model(model_key)
    prob = float(model.predict_proba(df)[0][1])
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
    if model_key not in MODEL_FILES:
        raise HTTPException(400, f"Unknown model '{model_key}'. Use: {list(MODEL_FILES)}")
    if model_key not in _configured_models():
        raise HTTPException(400, f"Model '{model_key}' is not configured. Available models: {_configured_models()}")


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


def _download_google_drive_file(url: str, output_path: Path, label: str) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {label} from Google Drive to {output_path}...")
    try:
        gdown.download(url=url, output=str(output_path), quiet=False, fuzzy=True)
    except Exception as exc:
        if output_path.exists():
            output_path.unlink()
        raise RuntimeError(f"Could not download {label}") from exc

    if not output_path.exists() or output_path.stat().st_size == 0:
        raise RuntimeError(f"Downloaded {label} is missing or empty: {output_path}")


def _safe_extract_zip(zip_path: Path, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    root = output_dir.resolve()
    with zipfile.ZipFile(zip_path) as archive:
        for member in archive.infolist():
            target = (output_dir / member.filename).resolve()
            if not target.is_relative_to(root):
                raise RuntimeError(f"Refusing to extract unsafe archive member: {member.filename}")
        archive.extractall(output_dir)


def _promote_eda_files(data_dir: Path) -> None:
    for filename in EDA_KNOWN_FILES:
        target = data_dir / filename
        if target.exists():
            continue
        matches = [path for path in data_dir.rglob(filename) if path.is_file()]
        if matches:
            shutil.copy2(matches[0], target)


def _download_eda_archive(data_dir: Path) -> bool:
    env_name, url = _first_env(EDA_ARCHIVE_URL_ENVS)
    if not url:
        return False

    data_dir.mkdir(parents=True, exist_ok=True)
    print(f"Preparing EDA data from {env_name}...")
    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        if "/folders/" in url:
            try:
                gdown.download_folder(url=url, output=str(data_dir), quiet=False)
            except Exception as exc:
                raise RuntimeError(f"Could not download EDA data folder from {env_name}") from exc
        else:
            archive_path = tmp_dir / "eda_data_download"
            _download_google_drive_file(url, archive_path, env_name)
            if zipfile.is_zipfile(archive_path):
                _safe_extract_zip(archive_path, data_dir)
            else:
                raise RuntimeError(
                    f"{env_name} must point to a Google Drive folder or a ZIP file containing {', '.join(EDA_KNOWN_FILES)}."
                )

    _promote_eda_files(data_dir)
    return True


def _download_eda_files(data_dir: Path) -> None:
    _download_eda_archive(data_dir)
    for filename, env_names in EDA_FILE_URL_ENVS.items():
        path = data_dir / filename
        if path.exists():
            continue
        env_name, url = _first_env(env_names)
        if not url:
            env_name = "built-in default"
            url = EDA_FILE_DEFAULT_URLS.get(filename, "")
        if url:
            _download_google_drive_file(url, path, env_name)


def _build_eda() -> dict:
    result: dict = {}
    data_dir = _get_data_dir()
    missing_eda_files = [filename for filename in EDA_KNOWN_FILES if not (data_dir / filename).exists()]
    if missing_eda_files:
        try:
            _download_eda_files(data_dir)
        except Exception as exc:
            if not (data_dir / "studentInfo.csv").exists():
                raise HTTPException(500, str(exc)) from exc
            print(f"Could not download optional EDA files ({', '.join(missing_eda_files)}): {exc}")
    result["data_dir"] = str(data_dir)

    # studentInfo.csv — primary source for most charts
    info_path = data_dir / "studentInfo.csv"
    if not info_path.exists():
        checked = ", ".join(str(path) for path in DATA_DIR_CANDIDATES)
        envs = ", ".join([*EDA_ARCHIVE_URL_ENVS, *[env for names in EDA_FILE_URL_ENVS.values() for env in names]])
        raise HTTPException(500, f"studentInfo.csv not found in data/raw/. Checked: {checked}. Configure one of: {envs}")

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
    return {"status": "ok", "models": _configured_models()}


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
