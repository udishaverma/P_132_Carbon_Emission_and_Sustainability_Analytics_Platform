"""
Forecast Service implementing chronological lag-based forecasting.
Reuses the exact algorithm and methodology from notebook 06.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from backend.app.config import (
    MODELING_DATA_PATH,
    TARGET,
    FEATURES,
    FORECAST_LAGS,
    RANDOM_STATE,
    FORECASTING_N_ESTIMATORS,
    FORECASTING_LEARNING_RATE,
    FORECASTING_MAX_DEPTH,
)


class ForecastService:
    _instance: Optional["ForecastService"] = None

    def __init__(self):
        self.model: Optional[GradientBoostingRegressor] = None
        self.features_with_lags: List[str] = []
        self.forecast_df: Optional[pd.DataFrame] = None
        self.historical_df: Optional[pd.DataFrame] = None
        self.test_evaluation: Optional[Dict[str, Any]] = None
        self.latest_year: int = 2022
        self._initialize_forecasting()

    @classmethod
    def get_instance(cls) -> "ForecastService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _initialize_forecasting(self) -> None:
        """
        Train time-series forecasting model and generate recursive projections for 2023-2027.
        Matches notebook 06 logic exactly.
        """
        if not MODELING_DATA_PATH.exists():
            raise FileNotFoundError(f"Data not found at {MODELING_DATA_PATH}")

        raw_df = pd.read_csv(MODELING_DATA_PATH)
        df = raw_df.sort_values(["country", "year"]).reset_index(drop=True)

        # Create lag features
        df["co2_lag_1"] = df.groupby("country")["co2"].shift(1)
        df["co2_lag_2"] = df.groupby("country")["co2"].shift(2)
        df["co2_lag_3"] = df.groupby("country")["co2"].shift(3)

        df = df.dropna().copy()
        self.historical_df = df

        self.features_with_lags = FEATURES + ["co2_lag_1", "co2_lag_2", "co2_lag_3"]

        # Chronological train/val/test split
        train = df[df["year"] <= 2016]
        val = df[df["year"].between(2017, 2020)]
        test = df[df["year"].between(2021, 2024)]

        X_train, y_train = train[self.features_with_lags], train[TARGET]
        X_val, y_val = val[self.features_with_lags], val[TARGET]
        X_test, y_test = test[self.features_with_lags], test[TARGET]

        # Train model
        model = GradientBoostingRegressor(
            n_estimators=FORECASTING_N_ESTIMATORS,
            learning_rate=FORECASTING_LEARNING_RATE,
            max_depth=FORECASTING_MAX_DEPTH,
            random_state=RANDOM_STATE
        )
        model.fit(X_train, y_train)
        self.model = model

        # Evaluate on validation and test periods
        val_pred = model.predict(X_val)
        test_pred = model.predict(X_test)

        self.test_evaluation = {
            "validation": {
                "period": "2017-2020",
                "mae": round(float(mean_absolute_error(y_val, val_pred)), 4),
                "rmse": round(float(np.sqrt(mean_squared_error(y_val, val_pred))), 4),
                "r2": round(float(r2_score(y_val, val_pred)), 4),
            },
            "test": {
                "period": "2021-2022",
                "mae": round(float(mean_absolute_error(y_test, test_pred)), 4),
                "rmse": round(float(np.sqrt(mean_squared_error(y_test, test_pred))), 4),
                "r2": round(float(r2_score(y_test, test_pred)), 4),
            },
        }

        # Generate future projections (2023-2027) using recursive lags (Cell 5)
        self.latest_year = int(df["year"].max())
        latest = df[df["year"] == self.latest_year].copy()

        future_rows = []
        for _, row in latest.iterrows():
            lag1, lag2, lag3 = float(row["co2"]), float(row["co2_lag_1"]), float(row["co2_lag_2"])

            for year in range(self.latest_year + 1, self.latest_year + 6):
                future_row = row[self.features_with_lags].copy()
                future_row["year"] = year
                future_row["co2_lag_1"] = lag1
                future_row["co2_lag_2"] = lag2
                future_row["co2_lag_3"] = lag3

                pred = float(model.predict(pd.DataFrame([future_row], columns=self.features_with_lags))[0])
                pred = max(0.0, pred)
                future_rows.append({
                    "country": row["country"],
                    "year": year,
                    "predicted_co2": round(pred, 2)
                })

                lag3, lag2, lag1 = lag2, lag1, pred

        self.forecast_df = pd.DataFrame(future_rows)

    def get_forecast(
        self,
        country: Optional[str] = None,
        horizon: int = 5
    ) -> Dict[str, Any]:
        """
        Return historical time series and projected emissions for a country or global panel.
        Horizon is constrained between 1 and 5 years (2023 - 2027).
        """
        horizon = max(1, min(5, horizon))
        df_hist = self.historical_df
        df_fore = self.forecast_df

        is_global = not country or country.lower() in ["world", "all", "global"]

        if is_global:
            # Aggregate across all 79 tracked countries
            hist_series = (
                df_hist.groupby("year")["co2"]
                .sum()
                .reset_index()
                .rename(columns={"co2": "actual_co2"})
            )
            fore_series = (
                df_fore[df_fore["year"] <= (self.latest_year + horizon)]
                .groupby("year")["predicted_co2"]
                .sum()
                .reset_index()
            )
            display_name = "Global Total (79 Countries Panel)"
        else:
            # Country-specific forecast
            country_clean = country.strip()
            available_countries = df_hist["country"].unique()
            if country_clean not in available_countries:
                country_clean = "United States"

            hist_series = (
                df_hist[df_hist["country"] == country_clean][["year", "co2"]]
                .sort_values("year")
                .rename(columns={"co2": "actual_co2"})
            )
            fore_series = (
                df_fore[
                    (df_fore["country"] == country_clean) &
                    (df_fore["year"] <= (self.latest_year + horizon))
                ][["year", "predicted_co2"]]
                .sort_values("year")
            )
            display_name = country_clean

        # Combine into unified timeline for chart visualization
        # To show a smooth visual transition, connect latest historical point to forecast
        combined_chart_data = []

        latest_actual_val = None
        for _, row in hist_series.iterrows():
            yr = int(row["year"])
            val = round(float(row["actual_co2"]), 2)
            latest_actual_val = val
            combined_chart_data.append({
                "year": yr,
                "historical": val,
                "forecast": None,
                "type": "observed",
            })

        # Add connection point at latest historical year
        if combined_chart_data:
            combined_chart_data[-1]["forecast"] = latest_actual_val

        forecast_table = []
        for _, row in fore_series.iterrows():
            yr = int(row["year"])
            val = round(float(row["predicted_co2"]), 2)
            combined_chart_data.append({
                "year": yr,
                "historical": None,
                "forecast": val,
                "type": "projected",
            })
            forecast_table.append({
                "year": yr,
                "predicted_co2": val,
                "unit": "Million tonnes (Mt)",
                "status": "Conditional Projection",
            })

        return {
            "country": display_name,
            "is_global": is_global,
            "horizon_years": horizon,
            "start_forecast_year": self.latest_year + 1,
            "end_forecast_year": self.latest_year + horizon,
            "latest_historical_year": self.latest_year,
            "chart_data": combined_chart_data,
            "forecast_table": forecast_table,
            "test_evaluation": self.test_evaluation,
            "assumptions": [
                "Lag-based autoregressive features (co2_lag_1, lag_2, lag_3) are updated recursively for each forward year.",
                "Non-lag socioeconomic and energy predictors (GDP, energy consumption, fossil share) are carried forward from latest observed year (2022).",
                "These values represent conditional projections under static structural inputs, not unconditional multi-year forecasts with independent future macroeconomic projections.",
                "Persistence baseline evaluation demonstrates that short-term emissions momentum is strong, requiring rigorous temporal validation.",
            ],
        }
