"""
Impact Service analyzing the relationship between renewable energy adoption and CO₂ emissions.
Matches notebook 08 logic and outputs.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

from backend.app.config import MODELING_DATA_PATH


class ImpactService:
    _instance: Optional["ImpactService"] = None

    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.global_results: Optional[Dict[str, Any]] = None
        self._initialize_analysis()

    @classmethod
    def get_instance(cls) -> "ImpactService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _initialize_analysis(self) -> None:
        if not MODELING_DATA_PATH.exists():
            raise FileNotFoundError(f"Data not found at {MODELING_DATA_PATH}")

        df = pd.read_csv(MODELING_DATA_PATH)
        # Calculate co2_per_capita in tonnes/person
        df["co2_per_capita"] = df["co2"] * 1e6 / df["population_co2"]
        self.df = df

        # Run controlled regression on full panel (Notebook 08 Cell 4)
        impact_features = [
            "renewables_share_energy",
            "fossil_share_energy",
            "gdp_per_capita",
            "energy_per_capita",
        ]
        impact_labels = {
            "renewables_share_energy": "Renewable Share (%)",
            "fossil_share_energy": "Fossil Share (%)",
            "gdp_per_capita": "GDP per Capita",
            "energy_per_capita": "Energy per Capita",
        }

        impact_df = df[["co2_per_capita"] + impact_features].dropna().copy()
        scaler_X = StandardScaler()
        scaler_y = StandardScaler()

        X_scaled = scaler_X.fit_transform(impact_df[impact_features])
        y_scaled = scaler_y.fit_transform(impact_df[["co2_per_capita"]]).ravel()

        model = LinearRegression()
        model.fit(X_scaled, y_scaled)
        r2 = float(model.score(X_scaled, y_scaled))

        coefficients = []
        for feat, coef in zip(impact_features, model.coef_):
            coefficients.append({
                "feature": feat,
                "label": impact_labels.get(feat, feat),
                "coefficient": round(float(coef), 4),
                "absolute_effect": round(abs(float(coef)), 4),
                "direction": "negative" if coef < 0 else "positive",
            })
        coefficients.sort(key=lambda x: x["coefficient"])

        # Quartile adoption groups (Notebook 08 Cell 3)
        df["renewable_group"] = pd.qcut(
            df["renewables_share_energy"],
            q=4,
            labels=["Low", "Moderate", "High", "Very High"],
        )

        group_summary = (
            df.groupby("renewable_group", observed=True)
            .agg(
                average_renewable_share=("renewables_share_energy", "mean"),
                average_co2=("co2", "mean"),
                average_co2_per_capita=("co2_per_capita", "mean"),
                average_fossil_share=("fossil_share_energy", "mean"),
                observations=("co2", "size"),
            )
            .reset_index()
        )

        adoption_groups = []
        for _, row in group_summary.iterrows():
            adoption_groups.append({
                "group": str(row["renewable_group"]),
                "average_renewable_share": round(float(row["average_renewable_share"]), 2),
                "average_co2": round(float(row["average_co2"]), 2),
                "average_co2_per_capita": round(float(row["average_co2_per_capita"]), 3),
                "average_fossil_share": round(float(row["average_fossil_share"]), 2),
                "observations": int(row["observations"]),
            })

        # Global time series (Notebook 08 Cell 5)
        yearly = (
            df.groupby("year")
            .agg(
                renewable_share=("renewables_share_energy", "mean"),
                co2=("co2", "sum"),
                co2_per_capita=("co2_per_capita", "mean"),
            )
            .reset_index()
        )

        trends = []
        for _, row in yearly.iterrows():
            trends.append({
                "year": int(row["year"]),
                "renewable_share": round(float(row["renewable_share"]), 2),
                "co2_per_capita": round(float(row["co2_per_capita"]), 3),
                "total_co2": round(float(row["co2"]), 2),
            })

        corr_total = float(df["renewables_share_energy"].corr(df["co2"]))
        corr_per_capita = float(df["renewables_share_energy"].corr(df["co2_per_capita"]))

        self.global_results = {
            "controlled_model_r2": round(r2, 4),
            "standardized_coefficients": coefficients,
            "adoption_groups": adoption_groups,
            "global_trends": trends,
            "correlations": {
                "corr_total_co2": round(corr_total, 4),
                "corr_co2_per_capita": round(corr_per_capita, 4),
            },
        }

    def get_impact_data(self, country: Optional[str] = None) -> Dict[str, Any]:
        """
        Return impact data:
        - If country is specified, filter time series and highlight country in scatter plots.
        - If country is None or "World", return global aggregated analytics.
        """
        df = self.df.copy()
        is_global = not country or country.lower() in ["world", "all", "global"]

        country_clean = country if not is_global else None
        if country_clean and country_clean not in df["country"].values:
            country_clean = None
            is_global = True

        # Scatter plot sample points (e.g. latest year or all years)
        # Using 2022 points for country-by-country scatter
        latest_year = int(df["year"].max())
        df_latest = df[df["year"] == latest_year]

        scatter_data = []
        for _, row in df_latest.iterrows():
            scatter_data.append({
                "country": row["country"],
                "year": int(row["year"]),
                "renewables_share": round(float(row["renewables_share_energy"]), 2),
                "co2": round(float(row["co2"]), 2),
                "co2_per_capita": round(float(row["co2_per_capita"]), 3),
                "is_selected": row["country"] == country_clean if country_clean else False,
            })

        # Country-specific time trend vs global average
        if country_clean:
            country_df = df[df["country"] == country_clean].sort_values("year")
            country_trends = []
            for _, row in country_df.iterrows():
                country_trends.append({
                    "year": int(row["year"]),
                    "country_renewable_share": round(float(row["renewables_share_energy"]), 2),
                    "country_co2_per_capita": round(float(row["co2_per_capita"]), 3),
                    "country_co2": round(float(row["co2"]), 2),
                })
        else:
            country_trends = []

        return {
            "selected_country": country_clean,
            "is_global": is_global,
            "latest_year": latest_year,
            "scatter_points": scatter_data,
            "adoption_groups": self.global_results["adoption_groups"],
            "global_trends": self.global_results["global_trends"],
            "country_trends": country_trends,
            "controlled_regression": {
                "r2": self.global_results["controlled_model_r2"],
                "coefficients": self.global_results["standardized_coefficients"],
            },
            "correlations": self.global_results["correlations"],
            "methodology_notes": [
                "Controlled regression uses standardized predictors (mean 0, standard deviation 1) so effect sizes can be directly compared across different units.",
                "Correlation and regression models describe statistical associations in observational data and do not alone prove causal mechanisms.",
                "A negative coefficient for renewable energy share indicates that higher renewable penetration is associated with lower per-capita emissions when holding fossil fuel share, GDP per capita, and energy consumption constant.",
            ],
        }
