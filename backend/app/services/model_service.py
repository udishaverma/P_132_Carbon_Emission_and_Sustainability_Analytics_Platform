"""
Model Service for regression modeling, evaluation metrics, and prediction inference.
"""

from typing import Dict, Any, List, Optional
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from backend.app.config import (
    MODELING_DATA_PATH,
    MODEL_EVALUATION_PATH,
    FEATURE_IMPORTANCE_PATH,
    TARGET,
    FEATURES,
    FEATURE_LABELS,
    RANDOM_STATE,
    GRADIENT_BOOSTING_N_ESTIMATORS,
    GRADIENT_BOOSTING_LEARNING_RATE,
    GRADIENT_BOOSTING_MAX_DEPTH,
)


class ModelService:
    _instance: Optional["ModelService"] = None

    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.best_model_name: str = "Gradient Boosting"
        self.scaler: Optional[StandardScaler] = None
        self.test_data: Optional[pd.DataFrame] = None
        self.test_predictions: Dict[str, np.ndarray] = {}
        self.evaluation_results: Optional[List[Dict[str, Any]]] = None
        self.feature_importance: Optional[List[Dict[str, Any]]] = None
        self.feature_stats: Dict[str, Dict[str, float]] = {}
        self._initialize_models()

    @classmethod
    def get_instance(cls) -> "ModelService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _initialize_models(self) -> None:
        """
        Train regression models and calculate evaluation diagnostics.
        Uses exact 70/15/15 split and hyperparameters from notebook 05.
        """
        if not MODELING_DATA_PATH.exists():
            raise FileNotFoundError(f"Modeling data missing at {MODELING_DATA_PATH}")

        df = pd.read_csv(MODELING_DATA_PATH)
        X = df[FEATURES]
        y = df[TARGET]

        # Calculate statistics for each feature to guide input forms
        for col in FEATURES:
            self.feature_stats[col] = {
                "min": float(X[col].min()),
                "max": float(X[col].max()),
                "mean": float(X[col].mean()),
                "median": float(X[col].median()),
                "std": float(X[col].std()),
                "label": FEATURE_LABELS.get(col, col),
            }

        # 70/15/15 Data Split
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=0.30, random_state=RANDOM_STATE
        )
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=0.50, random_state=RANDOM_STATE
        )

        # Scale for Linear Regression
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_val_scaled = scaler.transform(X_val)
        X_test_scaled = scaler.transform(X_test)
        self.scaler = scaler

        lr = LinearRegression()
        lr.fit(X_train_scaled, y_train)

        rf = RandomForestRegressor(
            n_estimators=300,
            random_state=RANDOM_STATE,
            n_jobs=-1
        )
        rf.fit(X_train, y_train)

        gb = GradientBoostingRegressor(
            n_estimators=GRADIENT_BOOSTING_N_ESTIMATORS,
            learning_rate=GRADIENT_BOOSTING_LEARNING_RATE,
            max_depth=GRADIENT_BOOSTING_MAX_DEPTH,
            random_state=RANDOM_STATE
        )
        gb.fit(X_train, y_train)

        self.models = {
            "Linear Regression": lr,
            "Random Forest": rf,
            "Gradient Boosting": gb,
        }

        # Store test predictions
        self.test_predictions = {
            "Linear Regression": lr.predict(X_test_scaled),
            "Random Forest": rf.predict(X_test),
            "Gradient Boosting": gb.predict(X_test),
        }

        # Save test dataframe with country and actuals for error diagnostics
        test_cols = ["country"] + [c for c in FEATURES if c != "country"]
        test_df = df.loc[y_test.index, test_cols].copy()
        test_df["actual_co2"] = y_test.values
        test_df["predicted_co2"] = self.test_predictions["Gradient Boosting"]
        test_df["residual"] = test_df["actual_co2"] - test_df["predicted_co2"]
        test_df["absolute_error"] = test_df["residual"].abs()
        self.test_data = test_df

        # Load or populate evaluation metrics
        if MODEL_EVALUATION_PATH.exists():
            eval_csv = pd.read_csv(MODEL_EVALUATION_PATH)
            # Normalize column names
            eval_csv.columns = [c.replace("²", "2") for c in eval_csv.columns]
            self.evaluation_results = eval_csv.to_dict(orient="records")
        else:
            self.evaluation_results = [
                {
                    "Model": "Gradient Boosting",
                    "MAE": round(float(mean_absolute_error(y_test, self.test_predictions["Gradient Boosting"])), 4),
                    "RMSE": round(float(np.sqrt(mean_squared_error(y_test, self.test_predictions["Gradient Boosting"]))), 4),
                    "R2": round(float(r2_score(y_test, self.test_predictions["Gradient Boosting"])), 4),
                },
                {
                    "Model": "Random Forest",
                    "MAE": round(float(mean_absolute_error(y_test, self.test_predictions["Random Forest"])), 4),
                    "RMSE": round(float(np.sqrt(mean_squared_error(y_test, self.test_predictions["Random Forest"]))), 4),
                    "R2": round(float(r2_score(y_test, self.test_predictions["Random Forest"])), 4),
                },
                {
                    "Model": "Linear Regression",
                    "MAE": round(float(mean_absolute_error(y_test, self.test_predictions["Linear Regression"])), 4),
                    "RMSE": round(float(np.sqrt(mean_squared_error(y_test, self.test_predictions["Linear Regression"]))), 4),
                    "R2": round(float(r2_score(y_test, self.test_predictions["Linear Regression"])), 4),
                },
            ]

        # Load or calculate feature importance
        if FEATURE_IMPORTANCE_PATH.exists():
            fi_df = pd.read_csv(FEATURE_IMPORTANCE_PATH)
            fi_list = []
            for _, r in fi_df.iterrows():
                feat = r["Feature"]
                fi_list.append({
                    "feature": feat,
                    "importance": round(float(r["Importance"]), 6),
                    "percentage": round(float(r["Importance"]) * 100, 2),
                    "label": FEATURE_LABELS.get(feat, feat),
                })
            self.feature_importance = fi_list
        else:
            importances = gb.feature_importances_
            fi_list = []
            for feat, imp in zip(FEATURES, importances):
                fi_list.append({
                    "feature": feat,
                    "importance": round(float(imp), 6),
                    "percentage": round(float(imp) * 100, 2),
                    "label": FEATURE_LABELS.get(feat, feat),
                })
            self.feature_importance = sorted(fi_list, key=lambda x: x["importance"], reverse=True)

    def get_metadata(self) -> Dict[str, Any]:
        """Return metadata required by the frontend prediction form and analysis."""
        return {
            "selected_model": self.best_model_name,
            "features": FEATURES,
            "feature_labels": FEATURE_LABELS,
            "feature_stats": self.feature_stats,
            "evaluation_results": self.evaluation_results,
            "feature_importance": self.feature_importance,
            "model_parameters": {
                "algorithm": "Gradient Boosting Regressor",
                "n_estimators": GRADIENT_BOOSTING_N_ESTIMATORS,
                "learning_rate": GRADIENT_BOOSTING_LEARNING_RATE,
                "max_depth": GRADIENT_BOOSTING_MAX_DEPTH,
                "split": "70% Train / 15% Validation / 15% Test",
                "random_state": RANDOM_STATE,
            },
        }

    def get_test_diagnostics(self, limit: int = 200) -> Dict[str, Any]:
        """Return actual vs predicted points and error distributions from the held-out test set."""
        if self.test_data is None:
            return {}

        # Sample or return test points for actual vs predicted plot
        points = []
        for _, row in self.test_data.iterrows():
            points.append({
                "country": row["country"],
                "year": int(row["year"]),
                "actual": round(float(row["actual_co2"]), 2),
                "predicted": round(float(row["predicted_co2"]), 2),
                "residual": round(float(row["residual"]), 2),
                "absolute_error": round(float(row["absolute_error"]), 2),
            })

        # Top 10 observations with highest absolute error
        top_errors = sorted(points, key=lambda x: x["absolute_error"], reverse=True)[:10]

        return {
            "test_points": points[:limit],
            "total_test_samples": len(points),
            "top_errors": top_errors,
        }

    def predict(self, feature_values: Dict[str, float], model_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate prediction for an ordered input vector.
        """
        chosen_model_name = model_name or self.best_model_name
        if chosen_model_name not in self.models:
            chosen_model_name = self.best_model_name

        model = self.models[chosen_model_name]

        # Extract features in exact order
        try:
            vector = [float(feature_values[feat]) for feat in FEATURES]
        except KeyError as e:
            raise ValueError(f"Missing required feature: {e}")

        X_input = pd.DataFrame([vector], columns=FEATURES)

        if chosen_model_name == "Linear Regression":
            X_input_scaled = self.scaler.transform(X_input)
            prediction = float(model.predict(X_input_scaled)[0])
        else:
            prediction = float(model.predict(X_input)[0])

        # Ensure realistic lower bound (emissions cannot be physically negative)
        display_prediction = max(0.0, prediction)

        return {
            "model_used": chosen_model_name,
            "predicted_co2": round(display_prediction, 3),
            "raw_prediction": round(prediction, 3),
            "unit": "Million tonnes (Mt)",
            "features_used": {feat: round(val, 4) for feat, val in zip(FEATURES, vector)},
            "note": "Regression model prediction based on 13 socioeconomic and energy indicators.",
        }
