"""
processing.py

Prepare OULAD-like raw records for the selected 50% Early Warning model.

Supported inputs:
    1) Folder of CSV files:
       studentInfo.csv, courses.csv, studentVle.csv, assessments.csv, studentAssessment.csv
       Optional: vle.csv, used for activity-type click features.
    2) JSON file with the same table names as top-level keys.
    3) XLSX file with the same table names as sheet names.
    4) SQLite .db file with the same table names.
    5) A single feature-ready CSV/JSON/XLSX/DB table that already contains all MODEL_FEATURES.

Main output:
    A model-ready DataFrame with the exact selected_features_q2 columns.

Optional prediction:
    If a saved model path is provided, the script prints risk_prediction and risk_probability.
"""

from __future__ import annotations

import argparse
import json
import sqlite3
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any

import joblib
import numpy as np
import pandas as pd


# -----------------------------------------------------------------------------
# Project constants
# -----------------------------------------------------------------------------

ARAB_SEMESTER_LENGTH = 150
DEFAULT_CUTOFF_RATIO = 0.50

KEY_COLUMNS = ["id_student", "code_module", "code_presentation"]

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

CATEGORICAL_FEATURES = ["age_band", "highest_education", "imd_band"]
NUMERIC_FEATURES = [col for col in MODEL_FEATURES if col not in CATEGORICAL_FEATURES]

ACTIVITY_FEATURES = ["homepage", "forumng", "resource", "subpage", "url", "oucontent", "quiz"]

REQUIRED_TABLES = {
    "studentInfo": [
        "id_student", "code_module", "code_presentation",
        "age_band", "highest_education", "imd_band",
    ],
    "courses": [
        "code_module", "code_presentation", "module_presentation_length",
    ],
    "studentVle": [
        "id_student", "code_module", "code_presentation",
        "id_site", "date", "sum_click",
    ],
    "assessments": [
        "id_assessment", "code_module", "code_presentation", "date",
    ],
    "studentAssessment": [
        "id_student", "id_assessment", "date_submitted", "score",
    ],
}

OPTIONAL_TABLES = {
    "vle": [
        "id_site", "code_module", "code_presentation", "activity_type",
    ],
}

KNOWN_TABLES = set(REQUIRED_TABLES) | set(OPTIONAL_TABLES)

# Columns that must be numeric because feature-engineering operations depend on them.
NUMERIC_REQUIRED_COLUMNS = {
    "courses": ["module_presentation_length"],
    "studentVle": ["date", "sum_click"],
    "assessments": ["date"],
    "studentAssessment": ["date_submitted", "score"],
}

TABLE_ALIASES = {
    "studentinfo": "studentInfo",
    "student_info": "studentInfo",
    "students": "studentInfo",
    "courses": "courses",
    "course": "courses",
    "studentvle": "studentVle",
    "student_vle": "studentVle",
    "vle_logs": "studentVle",
    "logs": "studentVle",
    "vle": "vle",
    "activities": "vle",
    "assessments": "assessments",
    "studentassessment": "studentAssessment",
    "student_assessment": "studentAssessment",
    "submissions": "studentAssessment",
}

COLUMN_ALIASES = {
    "student_id": "id_student",
    "course_module": "code_module",
    "module": "code_module",
    "course_presentation": "code_presentation",
    "presentation": "code_presentation",
    "course_length": "module_presentation_length",
    "presentation_length": "module_presentation_length",
    "activity_id": "id_site",
    "site_id": "id_site",
    "event_date": "date",
    "event_day": "date",
    "clicks": "sum_click",
    "assessment_id": "id_assessment",
    "due_date": "date",
    "assessment_date": "date",
    "submitted_at": "date_submitted",
    "submission_date": "date_submitted",
}


# -----------------------------------------------------------------------------
# User-facing errors
# -----------------------------------------------------------------------------

class ProcessingInputError(Exception):
    """Error raised when user input data is missing or invalid."""

    def __init__(self, message: str, *, table: Optional[str] = None,
                 column: Optional[str] = None, reason: Optional[str] = None,
                 action: Optional[str] = None):
        self.table = table
        self.column = column
        self.reason = reason
        self.action = action
        super().__init__(message)

    def friendly_message(self) -> str:
        parts = [f"ERROR: {self.args[0]}"]
        if self.table:
            parts.append(f"Table: {self.table}")
        if self.column:
            parts.append(f"Column: {self.column}")
        if self.reason:
            parts.append(f"Reason: {self.reason}")
        if self.action:
            parts.append(f"Action: {self.action}")
        return "\n".join(parts)


# -----------------------------------------------------------------------------
# Loading input files
# -----------------------------------------------------------------------------

def _canonical_table_name(name: str) -> str:
    cleaned = Path(str(name)).stem.strip().replace(" ", "_").lower()
    return TABLE_ALIASES.get(cleaned, name)


def _standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [str(c).strip() for c in df.columns]
    rename_map = {c: COLUMN_ALIASES.get(c.strip().lower(), c) for c in df.columns}
    return df.rename(columns=rename_map)


def _is_feature_ready_table(df: pd.DataFrame) -> bool:
    return set(MODEL_FEATURES).issubset(set(df.columns))


def _load_csv_folder(folder: Path) -> Dict[str, pd.DataFrame]:
    data: Dict[str, pd.DataFrame] = {}
    for csv_path in folder.glob("*.csv"):
        table_name = _canonical_table_name(csv_path.name)
        if table_name in KNOWN_TABLES:
            data[table_name] = _standardize_columns(pd.read_csv(csv_path))
    return data


def _load_json(path: Path) -> Dict[str, pd.DataFrame]:
    with path.open("r", encoding="utf-8") as f:
        payload = json.load(f)

    if isinstance(payload, list):
        df = _standardize_columns(pd.DataFrame(payload))
        if _is_feature_ready_table(df):
            return {"feature_table": df}
        raise ProcessingInputError(
            "Single-list JSON is not feature-ready.",
            reason="A JSON list must already contain all model features, otherwise raw OULAD-like data must be nested by table name.",
            action="Use a JSON object with keys: studentInfo, courses, studentVle, assessments, studentAssessment. Add optional vle for activity-type features."
        )

    if not isinstance(payload, dict):
        raise ProcessingInputError(
            "Invalid JSON structure.",
            reason="The JSON root must be either an object of tables or a list of feature-ready rows.",
            action="Provide a table-keyed JSON object or a feature-ready row list."
        )

    data: Dict[str, pd.DataFrame] = {}
    for key, value in payload.items():
        table_name = _canonical_table_name(key)
        if isinstance(value, list):
            data[table_name] = _standardize_columns(pd.DataFrame(value))
        elif isinstance(value, dict):
            data[table_name] = _standardize_columns(pd.json_normalize(value))

    if "feature_table" in data and _is_feature_ready_table(data["feature_table"]):
        return data

    # Allow JSON like {"rows": [...]} if rows are already feature-ready.
    for df in data.values():
        if _is_feature_ready_table(df):
            return {"feature_table": df}

    return {k: v for k, v in data.items() if k in KNOWN_TABLES}


def _load_xlsx(path: Path) -> Dict[str, pd.DataFrame]:
    sheets = pd.read_excel(path, sheet_name=None)
    data = {_canonical_table_name(name): _standardize_columns(df) for name, df in sheets.items()}

    for df in data.values():
        if _is_feature_ready_table(df):
            return {"feature_table": df}

    return {k: v for k, v in data.items() if k in KNOWN_TABLES}


def _load_sqlite_db(path: Path) -> Dict[str, pd.DataFrame]:
    with sqlite3.connect(path) as conn:
        table_names = pd.read_sql(
            "SELECT name FROM sqlite_master WHERE type='table'", conn
        )["name"].tolist()

        data: Dict[str, pd.DataFrame] = {}
        for table in table_names:
            canonical = _canonical_table_name(table)
            df = _standardize_columns(pd.read_sql(f'SELECT * FROM "{table}"', conn))
            if _is_feature_ready_table(df):
                return {"feature_table": df}
            if canonical in KNOWN_TABLES:
                data[canonical] = df
    return data


def load_input(path: str | Path) -> Dict[str, pd.DataFrame]:
    """Load CSV folder, JSON, XLSX, or SQLite DB into canonical tables."""
    path = Path(path)

    if not path.exists():
        raise ProcessingInputError(
            "Input path does not exist.",
            reason=f"Could not find: {path}",
            action="Check the file or folder path and try again."
        )

    if path.is_dir():
        data = _load_csv_folder(path)
        if not data:
            raise ProcessingInputError(
                "No required CSV tables found in folder.",
                reason="The folder must contain OULAD-like CSV files.",
                action="Add CSV files named studentInfo.csv, courses.csv, studentVle.csv, assessments.csv, and studentAssessment.csv. Add optional vle.csv for activity-type features."
            )
        return data

    suffix = path.suffix.lower()

    if suffix == ".csv":
        df = _standardize_columns(pd.read_csv(path))
        if _is_feature_ready_table(df):
            return {"feature_table": df}
        raise ProcessingInputError(
            "Single CSV is not feature-ready.",
            reason="A raw OULAD-like input needs multiple tables, but a single CSV was provided and it does not contain all model features.",
            action="Provide a folder of CSV tables, or provide one CSV containing all MODEL_FEATURES."
        )

    if suffix == ".json":
        return _load_json(path)

    if suffix in {".xlsx", ".xls"}:
        return _load_xlsx(path)

    if suffix in {".db", ".sqlite", ".sqlite3"}:
        return _load_sqlite_db(path)

    raise ProcessingInputError(
        "Unsupported input file type.",
        reason=f"Received extension: {suffix}",
        action="Use a CSV folder, JSON, XLSX, or SQLite .db file."
    )


# -----------------------------------------------------------------------------
# Validation
# -----------------------------------------------------------------------------

def _validate_required_tables(data: Dict[str, pd.DataFrame]) -> None:
    if "feature_table" in data:
        return

    missing = [table for table in REQUIRED_TABLES if table not in data]
    if missing:
        raise ProcessingInputError(
            "Missing required table(s).",
            reason="The selected model requires OULAD-like raw records from specific tables.",
            action=f"Add the missing table(s): {missing}"
        )


def _validate_required_columns(data: Dict[str, pd.DataFrame]) -> None:
    if "feature_table" in data:
        missing = [c for c in MODEL_FEATURES if c not in data["feature_table"].columns]
        if missing:
            raise ProcessingInputError(
                "Feature-ready table is missing model column(s).",
                reason="The saved model expects exactly the selected feature columns.",
                action=f"Add these columns: {missing}"
            )
        return

    for table, required_cols in REQUIRED_TABLES.items():
        df = data[table]
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            raise ProcessingInputError(
                "Missing required column(s).",
                table=table,
                reason="This table is needed for feature engineering.",
                action=f"Add these column(s): {missing}"
            )

    for table, required_cols in OPTIONAL_TABLES.items():
        if table not in data:
            continue
        df = data[table]
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            raise ProcessingInputError(
                "Optional table is present but missing required column(s).",
                table=table,
                reason="This table can enrich activity-type features when provided.",
                action=f"Add these column(s), or remove the optional table: {missing}"
            )


def _coerce_numeric_column(df: pd.DataFrame, table: str, column: str) -> pd.Series:
    raw = df[column]
    converted = pd.to_numeric(raw, errors="coerce")

    invalid_mask = raw.notna() & converted.isna()
    if invalid_mask.any():
        examples = raw[invalid_mask].astype(str).head(5).tolist()
        raise ProcessingInputError(
            "Invalid numeric values.",
            table=table,
            column=column,
            reason=f"Column '{column}' must be numeric because it is used in feature engineering operations.",
            action=f"Fix non-numeric values. Invalid examples: {examples}"
        )

    return converted


def _validate_and_cast_types(data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
    data = {k: v.copy() for k, v in data.items()}

    if "feature_table" in data:
        df = data["feature_table"].copy()
        for col in NUMERIC_FEATURES:
            df[col] = _coerce_numeric_column(df, "feature_table", col)
        for col in CATEGORICAL_FEATURES:
            df[col] = df[col].fillna("Unknown").astype(str)
        data["feature_table"] = df
        return data

    for table, columns in NUMERIC_REQUIRED_COLUMNS.items():
        for column in columns:
            data[table][column] = _coerce_numeric_column(data[table], table, column)

    # Keep join keys consistent. Strings are safer because some exports may store IDs differently.
    for table, df in data.items():
        for col in ["id_student", "code_module", "code_presentation", "id_site", "id_assessment"]:
            if col in df.columns:
                df[col] = df[col].astype(str)

    return data


def validate_input(data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
    _validate_required_tables(data)
    _validate_required_columns(data)
    return _validate_and_cast_types(data)


# -----------------------------------------------------------------------------
# Feature engineering
# -----------------------------------------------------------------------------

def _prepare_feature_ready_table(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, List[str]]:
    warnings: List[str] = []
    df = df.copy()

    for col in NUMERIC_FEATURES:
        df[col] = pd.to_numeric(df[col], errors="coerce").replace([np.inf, -np.inf], np.nan).fillna(0)

    for col in CATEGORICAL_FEATURES:
        df[col] = df[col].fillna("Unknown").astype(str)

    id_cols = [c for c in KEY_COLUMNS if c in df.columns]
    ids = df[id_cols].copy() if id_cols else pd.DataFrame(index=df.index)
    model_df = df[MODEL_FEATURES].copy()
    audit_df = pd.concat([ids.reset_index(drop=True), model_df.reset_index(drop=True)], axis=1)
    return model_df, audit_df, warnings


def build_model_ready_dataframe(
    data: Dict[str, pd.DataFrame],
    cutoff_ratio: float = DEFAULT_CUTOFF_RATIO,
    arab_semester_length: int = ARAB_SEMESTER_LENGTH,
) -> Tuple[pd.DataFrame, pd.DataFrame, List[str]]:
    """
    Build the selected_features_q2 DataFrame from OULAD-like raw tables.

    Returns:
        model_df: only MODEL_FEATURES, ready for model.predict.
        audit_df: identifiers + MODEL_FEATURES, useful for printing results.
        warnings: non-fatal issues found during processing.
    """
    if not (0 < cutoff_ratio <= 1):
        raise ProcessingInputError(
            "Invalid cutoff ratio.",
            reason="cutoff_ratio must be greater than 0 and less than or equal to 1.",
            action="Use cutoff_ratio=0.50 for the selected 50% Early Warning model."
        )

    data = validate_input(data)
    warnings: List[str] = []

    if "feature_table" in data:
        return _prepare_feature_ready_table(data["feature_table"])

    student_info = data["studentInfo"].copy()
    courses = data["courses"].copy()
    student_vle = data["studentVle"].copy()
    vle = data.get("vle")
    if vle is not None:
        vle = vle.copy()
    assessments = data["assessments"].copy()
    student_assessment = data["studentAssessment"].copy()

    # Base student-course rows. Keep only the demographic features required by the model.
    base = student_info[
        KEY_COLUMNS + ["age_band", "highest_education", "imd_band"]
    ].drop_duplicates(KEY_COLUMNS).copy()

    base = base.merge(
        courses[["code_module", "code_presentation", "module_presentation_length"]],
        on=["code_module", "code_presentation"],
        how="left",
        validate="many_to_one"
    )

    if base["module_presentation_length"].isna().any():
        raise ProcessingInputError(
            "Course length missing after merging studentInfo with courses.",
            table="courses",
            column="module_presentation_length",
            reason="module_presentation_length is required to calculate 50% cutoff and Arab semester scaled features.",
            action="Make sure every studentInfo code_module/code_presentation exists in courses."
        )

    # ------------------------------------------------------------------
    # VLE features up to cutoff
    # ------------------------------------------------------------------
    if vle is None:
        warnings.append(
            "Optional table 'vle' was not provided. Activity-type click features will be filled with 0."
        )
        vle_events = student_vle.copy()
        vle_events["activity_type"] = np.nan
    else:
        vle_events = student_vle.merge(
            vle[["id_site", "code_module", "code_presentation", "activity_type"]],
            on=["id_site", "code_module", "code_presentation"],
            how="left",
            validate="many_to_one"
        )

    missing_activity_type = int(vle_events["activity_type"].isna().sum())
    if missing_activity_type and vle is not None:
        warnings.append(
            f"{missing_activity_type} studentVle rows could not be matched to vle.activity_type. "
            "These rows will not contribute to activity-type features."
        )

    vle_events = vle_events.merge(
        courses[["code_module", "code_presentation", "module_presentation_length"]],
        on=["code_module", "code_presentation"],
        how="left",
        validate="many_to_one"
    )

    if vle_events["module_presentation_length"].isna().any():
        raise ProcessingInputError(
            "Course length missing for studentVle records.",
            table="courses",
            column="module_presentation_length",
            reason="VLE relative_time cannot be calculated without course length.",
            action="Make sure every studentVle code_module/code_presentation exists in courses."
        )

    vle_events["relative_time"] = (
        vle_events["date"] / vle_events["module_presentation_length"]
    ).replace([np.inf, -np.inf], np.nan)

    vle_until_cutoff = vle_events[vle_events["relative_time"] <= cutoff_ratio].copy()

    if vle_until_cutoff.empty:
        warnings.append(
            "No VLE activity found before the cutoff. Activity-based features will be filled with 0."
        )
        vle_features = base[KEY_COLUMNS].copy()
        for col in [
            "total_clicks_until_cutoff", "active_days_until_cutoff",
            "unique_sites_until_cutoff", "unique_activity_types_until_cutoff",
            "clicks_per_active_day_until_cutoff", "arab_active_days_equivalent_until_cutoff",
        ]:
            vle_features[col] = 0
        activity_features = base[KEY_COLUMNS].copy()
        for col in ACTIVITY_FEATURES:
            activity_features[col] = 0
    else:
        vle_features = vle_until_cutoff.groupby(KEY_COLUMNS).agg(
            total_clicks_until_cutoff=("sum_click", "sum"),
            active_days_until_cutoff=("date", "nunique"),
            vle_module_presentation_length=("module_presentation_length", "first"),
            unique_sites_until_cutoff=("id_site", "nunique"),
            unique_activity_types_until_cutoff=("activity_type", "nunique"),
        ).reset_index()

        vle_features["clicks_per_active_day_until_cutoff"] = (
            vle_features["total_clicks_until_cutoff"] /
            vle_features["active_days_until_cutoff"]
        ).replace([np.inf, -np.inf], 0).fillna(0)

        vle_features["active_days_ratio_until_cutoff"] = (
            vle_features["active_days_until_cutoff"] /
            vle_features["vle_module_presentation_length"]
        ).replace([np.inf, -np.inf], 0).fillna(0)

        vle_features["arab_active_days_equivalent_until_cutoff"] = (
            vle_features["active_days_ratio_until_cutoff"] * arab_semester_length
        )

        if vle_until_cutoff["activity_type"].notna().any():
            activity_features = vle_until_cutoff.pivot_table(
                index=KEY_COLUMNS,
                columns="activity_type",
                values="sum_click",
                aggfunc="sum",
                fill_value=0,
            ).reset_index()
            activity_features.columns.name = None

            for col in ACTIVITY_FEATURES:
                if col not in activity_features.columns:
                    activity_features[col] = 0
                    warnings.append(
                        f"Activity type '{col}' was not found before cutoff. Feature '{col}' filled with 0."
                    )

            activity_features = activity_features[KEY_COLUMNS + ACTIVITY_FEATURES]
        else:
            activity_features = base[KEY_COLUMNS].copy()
            for col in ACTIVITY_FEATURES:
                activity_features[col] = 0

    # ------------------------------------------------------------------
    # Assessment features up to cutoff
    # ------------------------------------------------------------------
    assessment_full = student_assessment.merge(
        assessments[["id_assessment", "code_module", "code_presentation", "date"]],
        on="id_assessment",
        how="left",
        validate="many_to_one"
    )

    if assessment_full["date"].isna().any():
        raise ProcessingInputError(
            "Assessment due date missing after merging studentAssessment with assessments.",
            table="assessments",
            column="date",
            reason="Assessment date is required to calculate submission delay and cutoff filtering.",
            action="Make sure every studentAssessment id_assessment exists in assessments."
        )

    assessment_full = assessment_full.merge(
        courses[["code_module", "code_presentation", "module_presentation_length"]],
        on=["code_module", "code_presentation"],
        how="left",
        validate="many_to_one"
    )

    if assessment_full["module_presentation_length"].isna().any():
        raise ProcessingInputError(
            "Course length missing for assessment records.",
            table="courses",
            column="module_presentation_length",
            reason="Assessment relative times cannot be calculated without course length.",
            action="Make sure every assessments code_module/code_presentation exists in courses."
        )

    assessment_full["assessment_relative_time"] = (
        assessment_full["date"] / assessment_full["module_presentation_length"]
    ).replace([np.inf, -np.inf], np.nan)

    assessment_full["submitted_relative_time"] = (
        assessment_full["date_submitted"] / assessment_full["module_presentation_length"]
    ).replace([np.inf, -np.inf], np.nan)

    assessment_full["submission_delay_relative"] = (
        assessment_full["submitted_relative_time"] -
        assessment_full["assessment_relative_time"]
    )

    assessment_full["submission_delay_arab_days"] = (
        assessment_full["submission_delay_relative"] * arab_semester_length
    )

    assessment_until_cutoff = assessment_full[
        assessment_full["submitted_relative_time"] <= cutoff_ratio
    ].copy()

    if assessment_until_cutoff.empty:
        warnings.append(
            "No assessment submissions found before the cutoff. Assessment-based features will be filled with 0."
        )
        assessment_features = base[KEY_COLUMNS].copy()
        assessment_features["avg_score_until_cutoff"] = 0
        assessment_features["submitted_assessments_until_cutoff"] = 0
        assessment_features["avg_submission_delay_arab_days_until_cutoff"] = 0
    else:
        assessment_features = assessment_until_cutoff.groupby(KEY_COLUMNS).agg(
            avg_score_until_cutoff=("score", "mean"),
            submitted_assessments_until_cutoff=("id_assessment", "count"),
            avg_submission_delay_arab_days_until_cutoff=("submission_delay_arab_days", "mean"),
        ).reset_index()

    # ------------------------------------------------------------------
    # Final merge and cleanup
    # ------------------------------------------------------------------
    final_df = base.merge(
        vle_features[
            KEY_COLUMNS + [
                "unique_sites_until_cutoff",
                "unique_activity_types_until_cutoff",
                "clicks_per_active_day_until_cutoff",
                "arab_active_days_equivalent_until_cutoff",
            ]
        ],
        on=KEY_COLUMNS,
        how="left"
    )

    final_df = final_df.merge(activity_features, on=KEY_COLUMNS, how="left")
    final_df = final_df.merge(assessment_features, on=KEY_COLUMNS, how="left")

    for col in NUMERIC_FEATURES:
        if col not in final_df.columns:
            final_df[col] = 0
        final_df[col] = pd.to_numeric(final_df[col], errors="coerce").replace([np.inf, -np.inf], np.nan).fillna(0)

    for col in CATEGORICAL_FEATURES:
        if col not in final_df.columns:
            final_df[col] = "Unknown"
        final_df[col] = final_df[col].fillna("Unknown").astype(str)

    audit_df = final_df[KEY_COLUMNS + MODEL_FEATURES].copy()
    model_df = final_df[MODEL_FEATURES].copy()

    return model_df, audit_df, warnings


# -----------------------------------------------------------------------------
# Prediction
# -----------------------------------------------------------------------------

def prepare_data(input_path: str | Path, cutoff_ratio: float = DEFAULT_CUTOFF_RATIO) -> Tuple[pd.DataFrame, pd.DataFrame, List[str]]:
    """High-level function: load input, validate it, and return model-ready data."""
    raw_data = load_input(input_path)
    return build_model_ready_dataframe(raw_data, cutoff_ratio=cutoff_ratio)


def predict_at_risk(
    input_path: str | Path,
    model_path: str | Path,
    cutoff_ratio: float = DEFAULT_CUTOFF_RATIO,
) -> Tuple[pd.DataFrame, List[str]]:
    """Prepare data and run a saved sklearn/joblib pipeline model."""
    model_df, audit_df, warnings = prepare_data(input_path, cutoff_ratio=cutoff_ratio)

    model_path = Path(model_path)
    if not model_path.exists():
        raise ProcessingInputError(
            "Model file does not exist.",
            reason=f"Could not find model file: {model_path}",
            action="Pass the correct .pkl model path."
        )

    model = joblib.load(model_path)
    predictions = model.predict(model_df)

    result_df = audit_df[KEY_COLUMNS].copy() if all(c in audit_df.columns for c in KEY_COLUMNS) else pd.DataFrame(index=model_df.index)
    result_df["risk_prediction"] = predictions

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(model_df)
        if probabilities.ndim == 2 and probabilities.shape[1] > 1:
            result_df["risk_probability"] = probabilities[:, 1]
        else:
            result_df["risk_probability"] = probabilities.ravel()
    else:
        result_df["risk_probability"] = np.nan

    return result_df, warnings

# -----------------------------------------------------------------------------
# Manual input + manual prediction
# -----------------------------------------------------------------------------

def _ask_text(prompt: str, default: Optional[str] = None) -> str:
    suffix = f" [{default}]" if default is not None else ""
    value = input(f"{prompt}{suffix}: ").strip()

    if not value and default is not None:
        return str(default)

    while not value:
        print("This value is required.")
        value = input(f"{prompt}{suffix}: ").strip()

    return value


def _ask_float(prompt: str, default: Optional[float] = None) -> float:
    while True:
        suffix = f" [{default}]" if default is not None else ""
        raw = input(f"{prompt}{suffix}: ").strip()

        if not raw and default is not None:
            return float(default)

        try:
            return float(raw)
        except ValueError:
            print("Invalid value. Please enter a numeric value.")


def _ask_int(prompt: str, default: Optional[int] = None) -> int:
    while True:
        suffix = f" [{default}]" if default is not None else ""
        raw = input(f"{prompt}{suffix}: ").strip()

        if not raw and default is not None:
            return int(default)

        try:
            return int(raw)
        except ValueError:
            print("Invalid value. Please enter an integer value.")


def collect_manual_input() -> Dict[str, pd.DataFrame]:
    print("\nManual OULAD-like input mode")
    print("Enter the basic raw records. The script will apply the same feature-engineering flow.\n")

    id_student = _ask_text("Student ID", "100001")
    code_module = _ask_text("Course module", "AAA")
    code_presentation = _ask_text("Course presentation", "2026J")

    age_band = _ask_text("Age band", "25-35")
    highest_education = _ask_text("Highest education", "HE Qualification")
    imd_band = _ask_text("IMD band", "20-30%")

    module_presentation_length = _ask_float("Module presentation length in days", 240)

    student_info = pd.DataFrame([{
        "id_student": id_student,
        "code_module": code_module,
        "code_presentation": code_presentation,
        "age_band": age_band,
        "highest_education": highest_education,
        "imd_band": imd_band,
    }])

    courses = pd.DataFrame([{
        "code_module": code_module,
        "code_presentation": code_presentation,
        "module_presentation_length": module_presentation_length,
    }])

    print("\nEnter VLE activity rows.")
    print("activity_type examples: homepage, forumng, resource, subpage, url, oucontent, quiz")

    student_vle_rows = []
    vle_rows = []
    seen_sites = set()

    vle_count = _ask_int("How many VLE activity rows do you want to enter?", 3)

    for i in range(vle_count):
        print(f"\nVLE row {i + 1}")

        id_site = _ask_text("id_site", str(1000 + i))
        activity_type = _ask_text(
            "activity_type",
            ACTIVITY_FEATURES[i % len(ACTIVITY_FEATURES)]
        )
        date = _ask_float("date/day number", 10 + i)
        sum_click = _ask_float("sum_click", 1)

        student_vle_rows.append({
            "id_student": id_student,
            "code_module": code_module,
            "code_presentation": code_presentation,
            "id_site": id_site,
            "date": date,
            "sum_click": sum_click,
        })

        site_key = (id_site, code_module, code_presentation)

        if site_key not in seen_sites:
            seen_sites.add(site_key)
            vle_rows.append({
                "id_site": id_site,
                "code_module": code_module,
                "code_presentation": code_presentation,
                "activity_type": activity_type,
            })

    if not student_vle_rows:
        student_vle_rows.append({
            "id_student": id_student,
            "code_module": code_module,
            "code_presentation": code_presentation,
            "id_site": "1000",
            "date": 0,
            "sum_click": 0,
        })

        vle_rows.append({
            "id_site": "1000",
            "code_module": code_module,
            "code_presentation": code_presentation,
            "activity_type": "homepage",
        })

    student_vle = pd.DataFrame(student_vle_rows)
    vle = pd.DataFrame(vle_rows)

    print("\nEnter assessment submission rows.")

    assessment_rows = []
    student_assessment_rows = []

    assessment_count = _ask_int("How many assessment submissions do you want to enter?", 2)

    for i in range(assessment_count):
        print(f"\nAssessment row {i + 1}")

        id_assessment = _ask_text("id_assessment", str(2000 + i))
        assessment_date = _ask_float("assessment due date/day number", 20 + i * 10)
        date_submitted = _ask_float("date_submitted/day number", assessment_date)
        score = _ask_float("score", 80)

        assessment_rows.append({
            "id_assessment": id_assessment,
            "code_module": code_module,
            "code_presentation": code_presentation,
            "date": assessment_date,
        })

        student_assessment_rows.append({
            "id_student": id_student,
            "id_assessment": id_assessment,
            "date_submitted": date_submitted,
            "score": score,
        })

    if not assessment_rows:
        assessment_rows.append({
            "id_assessment": "2000",
            "code_module": code_module,
            "code_presentation": code_presentation,
            "date": 0,
        })

        student_assessment_rows.append({
            "id_student": id_student,
            "id_assessment": "2000",
            "date_submitted": 0,
            "score": 0,
        })

    assessments = pd.DataFrame(assessment_rows)
    student_assessment = pd.DataFrame(student_assessment_rows)

    return {
        "studentInfo": student_info,
        "courses": courses,
        "studentVle": student_vle,
        "vle": vle,
        "assessments": assessments,
        "studentAssessment": student_assessment,
    }


def prepare_manual_data(
    cutoff_ratio: float = DEFAULT_CUTOFF_RATIO
) -> Tuple[pd.DataFrame, pd.DataFrame, List[str]]:
    raw_data = collect_manual_input()

    return build_model_ready_dataframe(
        raw_data,
        cutoff_ratio=cutoff_ratio
    )


def _predict_from_model_df(
    model_df: pd.DataFrame,
    audit_df: pd.DataFrame,
    model_path: str | Path,
) -> pd.DataFrame:
    model_path = Path(model_path)

    if not model_path.exists():
        raise ProcessingInputError(
            "Model file does not exist.",
            reason=f"Could not find model file: {model_path}",
            action="Pass the correct .pkl model path."
        )

    model = joblib.load(model_path)

    predictions = model.predict(model_df)

    if all(c in audit_df.columns for c in KEY_COLUMNS):
        result_df = audit_df[KEY_COLUMNS].copy()
    else:
        result_df = pd.DataFrame(index=model_df.index)

    result_df["risk_prediction"] = predictions

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(model_df)

        if probabilities.ndim == 2 and probabilities.shape[1] > 1:
            result_df["risk_probability"] = probabilities[:, 1]
        else:
            result_df["risk_probability"] = probabilities.ravel()
    else:
        result_df["risk_probability"] = np.nan

    return result_df


def predict_at_risk_manual(
    model_path: str | Path,
    cutoff_ratio: float = DEFAULT_CUTOFF_RATIO,
) -> Tuple[pd.DataFrame, List[str]]:
    model_df, audit_df, warnings = prepare_manual_data(
        cutoff_ratio=cutoff_ratio
    )

    result_df = _predict_from_model_df(
        model_df,
        audit_df,
        model_path
    )

    return result_df, warnings

# -----------------------------------------------------------------------------
# CLI
# -----------------------------------------------------------------------------

def _print_warnings(warnings: List[str]) -> None:
    for warning in warnings:
        print(f"WARNING: {warning}")


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Prepare OULAD-like input data for the selected 50% Early Warning model."
    )

    parser.add_argument(
        "input_path",
        nargs="?",
        default=None,
        help="Path to CSV folder, JSON, XLSX, SQLite .db, or a feature-ready single table. Not required when using --manual."
    )

    parser.add_argument(
        "--manual",
        action="store_true",
        help="Ask the user to enter the required OULAD-like records manually."
    )

    parser.add_argument(
        "--model",
        dest="model_path",
        default=None,
        help="Optional path to a saved .pkl model. If provided, predictions will be printed."
    )

    parser.add_argument(
        "--cutoff",
        type=float,
        default=DEFAULT_CUTOFF_RATIO,
        help="Course-progress cutoff ratio. Default is 0.50 for Q2 model."
    )

    parser.add_argument(
        "--output",
        default=None,
        help="Optional CSV path to save the model-ready features or prediction results."
    )

    args = parser.parse_args(argv)

    try:
        if args.manual:
            if args.model_path:
                result_df, warnings = predict_at_risk_manual(
                    args.model_path,
                    cutoff_ratio=args.cutoff,
                )

                _print_warnings(warnings)

                print("\nPrediction result:")
                print(result_df.to_string(index=False))

                if args.output:
                    result_df.to_csv(args.output, index=False)
                    print(f"\nSaved prediction result to: {args.output}")

            else:
                model_df, audit_df, warnings = prepare_manual_data(
                    cutoff_ratio=args.cutoff
                )

                _print_warnings(warnings)

                print("\nModel-ready DataFrame preview:")
                print(audit_df.head().to_string(index=False))
                print(f"\nShape: {model_df.shape}")
                print("Columns:", list(model_df.columns))

                if args.output:
                    audit_df.to_csv(args.output, index=False)
                    print(f"\nSaved model-ready data to: {args.output}")

            return 0

        if args.input_path is None:
            raise ProcessingInputError(
                "Input path is required unless --manual is used.",
                reason="No input_path was provided and manual mode is disabled.",
                action="Provide an input path, for example: ..\\data\\raw, or run with --manual."
            )

        if args.model_path:
            result_df, warnings = predict_at_risk(
                args.input_path,
                args.model_path,
                cutoff_ratio=args.cutoff,
            )

            _print_warnings(warnings)

            print("\nPrediction result:")
            print(result_df.to_string(index=False))

            if args.output:
                result_df.to_csv(args.output, index=False)
                print(f"\nSaved prediction result to: {args.output}")

        else:
            model_df, audit_df, warnings = prepare_data(
                args.input_path,
                cutoff_ratio=args.cutoff
            )

            _print_warnings(warnings)

            print("\nModel-ready DataFrame preview:")
            print(audit_df.head().to_string(index=False))
            print(f"\nShape: {model_df.shape}")
            print("Columns:", list(model_df.columns))

            if args.output:
                audit_df.to_csv(args.output, index=False)
                print(f"\nSaved model-ready data to: {args.output}")

        return 0

    except ProcessingInputError as exc:
        print(exc.friendly_message(), file=sys.stderr)
        return 1

    except KeyboardInterrupt:
        print("\nERROR: Manual input cancelled by user.", file=sys.stderr)
        return 1

    except Exception as exc:
        print("ERROR: Unexpected processing failure.", file=sys.stderr)
        print(f"Reason: {type(exc).__name__}: {exc}", file=sys.stderr)
        print("Action: Check that your input follows the required OULAD-like schema and try again.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
