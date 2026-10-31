"""
Evaluation Service serving model validation results, cross-validation metrics,
and experimental evaluation artifacts.
"""

from typing import Dict, Any, List, Optional
from pathlib import Path
import pandas as pd

from backend.app.config import (
    MODEL_EVALUATION_PATH,
    FEATURE_IMPORTANCE_PATH,
    YUVINTERN_DIR,
    FEATURE_LABELS,
)


class EvaluationService:
    _instance: Optional["EvaluationService"] = None

    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._load_evaluation_data()

    @classmethod
    def get_instance(cls) -> "EvaluationService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_evaluation_data(self) -> None:
        # 1. Primary Model Comparison
        if MODEL_EVALUATION_PATH.exists():
            df_eval = pd.read_csv(MODEL_EVALUATION_PATH)
            df_eval.columns = [c.replace("²", "2") for c in df_eval.columns]
            self._cache["primary_regression"] = df_eval.round(4).to_dict(orient="records")
        else:
            self._cache["primary_regression"] = []

        # 2. Feature Importance
        if FEATURE_IMPORTANCE_PATH.exists():
            df_fi = pd.read_csv(FEATURE_IMPORTANCE_PATH)
            items = []
            for _, r in df_fi.iterrows():
                feat = r["Feature"]
                imp = float(r["Importance"])
                items.append({
                    "feature": feat,
                    "label": FEATURE_LABELS.get(feat, feat),
                    "importance": round(imp, 6),
                    "percentage": round(imp * 100, 2),
                })
            self._cache["feature_importance"] = items
        else:
            self._cache["feature_importance"] = []

        # 3. Grouped Cross-Validation (Notebook 10)
        cv_path = YUVINTERN_DIR / "grouped_cv_summary.csv"
        if cv_path.exists():
            df_cv = pd.read_csv(cv_path)
            self._cache["grouped_cv"] = df_cv.round(4).to_dict(orient="records")
        else:
            self._cache["grouped_cv"] = []

        # 4. Rolling Origin Forecast & Baseline Comparison (Notebook 10)
        baseline_comp_path = YUVINTERN_DIR / "final_test_baseline_comparison.csv"
        if baseline_comp_path.exists():
            df_base = pd.read_csv(baseline_comp_path)
            self._cache["forecasting_vs_baseline"] = df_base.round(4).to_dict(orient="records")
        else:
            self._cache["forecasting_vs_baseline"] = []

        # 5. Yearly Baseline Comparison
        yearly_path = YUVINTERN_DIR / "final_test_baseline_yearly.csv"
        if yearly_path.exists():
            df_yearly = pd.read_csv(yearly_path)
            self._cache["forecasting_yearly_comparison"] = df_yearly.round(4).to_dict(orient="records")
        else:
            self._cache["forecasting_yearly_comparison"] = []

    def get_full_evaluation(self) -> Dict[str, Any]:
        """Return full structured model evaluation data."""
        return {
            "primary_regression": self._cache.get("primary_regression", []),
            "feature_importance": self._cache.get("feature_importance", []),
            "grouped_cross_validation": self._cache.get("grouped_cv", []),
            "forecasting_vs_baseline": self._cache.get("forecasting_vs_baseline", []),
            "forecasting_yearly_comparison": self._cache.get("forecasting_yearly_comparison", []),
            "methodology_notes": {
                "random_split": "70/15/15 train/val/test random split evaluates in-distribution regression.",
                "grouped_cv": "5-fold GroupKFold CV tests generalizability to unseen countries not included in training folds.",
                "rolling_origin": "Expanding-window rolling origins (2012-2016) test temporal generalization across successive calendar years.",
                "persistence_baseline": "Compares Gradient Boosting against t-1 persistence (last year's observed emissions).",
            },
        }

    def get_feature_importance(self) -> List[Dict[str, Any]]:
        return self._cache.get("feature_importance", [])
