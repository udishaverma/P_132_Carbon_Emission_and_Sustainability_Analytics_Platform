"""
Data Service for loading, caching, and querying the project datasets.
"""

from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np

from backend.app.config import (
    MODELING_DATA_PATH,
    CLEANED_DATA_PATH,
    MERGED_DATA_PATH,
    RAW_CO2_DATA_PATH,
    FEATURES,
    FEATURE_LABELS,
)


class DataService:
    _instance: Optional["DataService"] = None

    def __init__(self):
        self._df_modeling: Optional[pd.DataFrame] = None
        self._countries: Optional[List[Dict[str, Any]]] = None
        self._load_data()

    @classmethod
    def get_instance(cls) -> "DataService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_data(self) -> None:
        """Load datasets once and create derived columns."""
        if not MODELING_DATA_PATH.exists():
            raise FileNotFoundError(f"Dataset not found at {MODELING_DATA_PATH}")

        df = pd.read_csv(MODELING_DATA_PATH)
        # Calculate co2_per_capita in tonnes per person (same as notebook 08)
        # co2 is in Mt (Million tonnes = 1e6 tonnes)
        df["co2_per_capita"] = (df["co2"] * 1e6) / df["population_co2"]

        self._df_modeling = df

        # Build list of 79 unique countries with metadata
        countries_list = []
        for country, group in df.groupby("country"):
            iso_code = group["iso_code_co2"].iloc[0] if "iso_code_co2" in group.columns else ""
            latest_row = group.sort_values("year").iloc[-1]
            earliest_row = group.sort_values("year").iloc[0]
            countries_list.append({
                "country": country,
                "iso_code": iso_code if pd.notna(iso_code) else "",
                "min_year": int(earliest_row["year"]),
                "max_year": int(latest_row["year"]),
                "latest_co2": float(latest_row["co2"]),
                "latest_co2_per_capita": float(latest_row["co2_per_capita"]),
                "observations": len(group),
            })
        self._countries = sorted(countries_list, key=lambda x: x["country"])

    @property
    def modeling_df(self) -> pd.DataFrame:
        if self._df_modeling is None:
            self._load_data()
        return self._df_modeling.copy()

    def get_countries(self) -> List[Dict[str, Any]]:
        """Return available countries with summary metadata."""
        return self._countries or []

    def get_available_metrics(self) -> List[Dict[str, str]]:
        """Return list of supported metrics with descriptions and units."""
        return [
            {
                "id": "co2",
                "label": "Total CO₂ Emissions",
                "unit": "Million tonnes (Mt)",
                "description": "Annual carbon dioxide emissions from fossil fuels and industry.",
            },
            {
                "id": "co2_per_capita",
                "label": "CO₂ Emissions per Capita",
                "unit": "Tonnes per person",
                "description": "Annual CO₂ emissions divided by the country's population.",
            },
            {
                "id": "primary_energy_consumption_energy",
                "label": "Primary Energy Consumption",
                "unit": "Terawatt-hours (TWh)",
                "description": "Total primary energy consumption from all sources.",
            },
            {
                "id": "renewables_share_energy",
                "label": "Renewable Energy Share",
                "unit": "%",
                "description": "Percentage of primary energy consumption sourced from renewables.",
            },
            {
                "id": "fossil_share_energy",
                "label": "Fossil Fuel Share",
                "unit": "%",
                "description": "Percentage of primary energy consumption sourced from fossil fuels.",
            },
            {
                "id": "renewables_electricity",
                "label": "Renewable Electricity Generation",
                "unit": "Terawatt-hours (TWh)",
                "description": "Electricity generated from solar, wind, hydro, and other renewables.",
            },
            {
                "id": "energy_per_capita",
                "label": "Energy Consumption per Capita",
                "unit": "Kilowatt-hours (kWh/person)",
                "description": "Average primary energy consumption per person.",
            },
            {
                "id": "gdp_per_capita",
                "label": "GDP per Capita",
                "unit": "USD (inflation-adjusted)",
                "description": "Gross domestic product per person.",
            },
            {
                "id": "population_co2",
                "label": "Population",
                "unit": "People",
                "description": "Total population of the country.",
            },
        ]

    def get_overview_data(self, year: Optional[int] = None) -> Dict[str, Any]:
        """
        Produce summary data for Page 1: Overview.
        Includes global aggregates, trends, top emitters, and renewable vs emissions summary.
        """
        df = self.modeling_df
        max_year = int(df["year"].max())
        min_year = int(df["year"].min())
        selected_year = year if year and min_year <= year <= max_year else max_year

        # Yearly global sum across the 79 countries in the dataset
        yearly_group = df.groupby("year").agg(
            total_co2=("co2", "sum"),
            total_population=("population_co2", "sum"),
            total_energy=("primary_energy_consumption_energy", "sum"),
            avg_renewable_share=("renewables_share_energy", "mean"),
        ).reset_index()

        yearly_group["co2_per_capita"] = (
            yearly_group["total_co2"] * 1e6 / yearly_group["total_population"]
        )

        # Calculate annual change for the latest year vs previous year
        latest_row = yearly_group[yearly_group["year"] == selected_year].iloc[0]
        prev_rows = yearly_group[yearly_group["year"] == (selected_year - 1)]

        annual_change_abs = None
        annual_change_pct = None
        if not prev_rows.empty:
            prev_row = prev_rows.iloc[0]
            annual_change_abs = float(latest_row["total_co2"] - prev_row["total_co2"])
            annual_change_pct = float(
                ((latest_row["total_co2"] - prev_row["total_co2"]) / prev_row["total_co2"]) * 100
            )

        # Historical global emissions line chart data
        historical_emissions = []
        for _, row in yearly_group.iterrows():
            historical_emissions.append({
                "year": int(row["year"]),
                "total_co2": round(float(row["total_co2"]), 2),
                "co2_per_capita": round(float(row["co2_per_capita"]), 3),
                "avg_renewable_share": round(float(row["avg_renewable_share"]), 2),
            })

        # Top emitters for the selected year
        df_year = df[df["year"] == selected_year]
        top_emitters = (
            df_year.sort_values("co2", ascending=False)
            .head(10)[["country", "iso_code_co2", "co2", "co2_per_capita", "renewables_share_energy"]]
            .to_dict(orient="records")
        )
        for item in top_emitters:
            item["co2"] = round(float(item["co2"]), 2)
            item["co2_per_capita"] = round(float(item["co2_per_capita"]), 3)
            item["renewables_share_energy"] = round(float(item["renewables_share_energy"]), 2)

        # Top 5 countries comparison over time for multi-country line chart
        top_5_countries = [item["country"] for item in top_emitters[:5]]
        top_countries_trend = []
        for yr in sorted(df["year"].unique()):
            row_data = {"year": int(yr)}
            yr_df = df[df["year"] == yr]
            for c in top_5_countries:
                c_row = yr_df[yr_df["country"] == c]
                if not c_row.empty:
                    row_data[c] = round(float(c_row["co2"].iloc[0]), 2)
                else:
                    row_data[c] = None
            top_countries_trend.append(row_data)

        # World aggregate data from raw OWID for context if available
        world_raw_context = None
        if RAW_CO2_DATA_PATH.exists():
            try:
                # Read just World rows
                raw_df = pd.read_csv(RAW_CO2_DATA_PATH, usecols=["country", "year", "co2", "co2_per_capita"])
                world_rows = raw_df[(raw_df["country"] == "World") & (raw_df["year"] == selected_year)]
                if not world_rows.empty:
                    world_raw_context = {
                        "year": int(selected_year),
                        "world_co2": round(float(world_rows["co2"].iloc[0]), 2),
                        "world_co2_per_capita": round(float(world_rows["co2_per_capita"].iloc[0]), 3),
                    }
            except Exception:
                world_raw_context = None

        return {
            "selected_year": selected_year,
            "latest_year": max_year,
            "min_year": min_year,
            "total_countries_tracked": int(df["country"].nunique()),
            "total_co2": round(float(latest_row["total_co2"]), 2),
            "co2_per_capita": round(float(latest_row["co2_per_capita"]), 3),
            "annual_change_abs": round(annual_change_abs, 2) if annual_change_abs is not None else None,
            "annual_change_pct": round(annual_change_pct, 2) if annual_change_pct is not None else None,
            "historical_emissions": historical_emissions,
            "top_emitters": top_emitters,
            "top_5_countries": top_5_countries,
            "top_countries_trend": top_countries_trend,
            "world_context": world_raw_context,
            "unit": "Million tonnes (Mt)",
        }

    def get_explorer_data(
        self,
        country: str = "United States",
        metric: str = "co2",
        start_year: int = 2000,
        end_year: int = 2022,
        comparison_year: int = 2022,
    ) -> Dict[str, Any]:
        """
        Data Explorer query handler.
        Returns country time-series, top-country comparisons for comparison_year, and filtered tabular rows.
        """
        df = self.modeling_df

        if country not in df["country"].values:
            country = "United States"

        if metric not in df.columns:
            metric = "co2"

        # Filter country time-series
        country_df = df[df["country"] == country].sort_values("year")
        filtered_country_df = country_df[
            (country_df["year"] >= start_year) & (country_df["year"] <= end_year)
        ]

        time_series = []
        for _, row in filtered_country_df.iterrows():
            val = row.get(metric)
            time_series.append({
                "year": int(row["year"]),
                "value": round(float(val), 4) if pd.notna(val) else None,
                "country": country,
            })

        # Comparison across countries for comparison_year
        comp_df = df[df["year"] == comparison_year].copy()
        if comp_df.empty:
            comparison_year = int(df["year"].max())
            comp_df = df[df["year"] == comparison_year].copy()

        # Sort descending by metric
        comp_df = comp_df.dropna(subset=[metric]).sort_values(metric, ascending=False)
        top_comparisons = []
        for _, row in comp_df.head(15).iterrows():
            top_comparisons.append({
                "country": row["country"],
                "value": round(float(row[metric]), 4),
                "is_selected": row["country"] == country,
            })

        # Tabular data for the selected country and year range
        table_columns = [
            "country",
            "year",
            "co2",
            "co2_per_capita",
            "primary_energy_consumption_energy",
            "fossil_share_energy",
            "renewables_share_energy",
            "gdp_per_capita",
        ]
        table_rows = []
        for _, row in filtered_country_df.iterrows():
            item = {}
            for col in table_columns:
                if col in row:
                    val = row[col]
                    item[col] = round(float(val), 2) if isinstance(val, (int, float, np.floating, np.integer)) and pd.notna(val) else (val if pd.notna(val) else None)
            table_rows.append(item)

        # Metric metadata
        metric_info = next(
            (m for m in self.get_available_metrics() if m["id"] == metric),
            {"id": metric, "label": metric, "unit": "", "description": ""}
        )

        return {
            "country": country,
            "metric": metric,
            "metric_info": metric_info,
            "start_year": start_year,
            "end_year": end_year,
            "comparison_year": comparison_year,
            "time_series": time_series,
            "top_comparisons": top_comparisons,
            "table_data": table_rows,
        }

    def get_country_features(self, country: str, year: int) -> Optional[Dict[str, float]]:
        """Retrieve actual feature vector for a country and year if present."""
        df = self.modeling_df
        matches = df[(df["country"] == country) & (df["year"] == year)]
        if matches.empty:
            return None
        row = matches.iloc[0]
        return {feat: float(row[feat]) for feat in FEATURES}
