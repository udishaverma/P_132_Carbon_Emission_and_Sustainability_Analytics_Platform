"""
Application configuration for the CO₂ Analytics and Prediction API.
"""

from pathlib import Path
import os

# Project root directory (HCL Project)
PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

MODELING_DATA_PATH = PROCESSED_DATA_DIR / "modeling_data.csv"
CLEANED_DATA_PATH = PROCESSED_DATA_DIR / "cleaned_data.csv"
MERGED_DATA_PATH = PROCESSED_DATA_DIR / "merged_model_base.csv"
RAW_CO2_DATA_PATH = RAW_DATA_DIR / "owid-co2-data.csv"

OUTPUTS_DIR = PROJECT_ROOT / "outputs"
FEATURE_IMPORTANCE_PATH = OUTPUTS_DIR / "feature_importance.csv"
MODEL_EVALUATION_PATH = OUTPUTS_DIR / "model_evaluation.csv"
YUVINTERN_DIR = OUTPUTS_DIR / "yuvaintern_evaluation"

# Target & Feature definitions (from notebooks 05, 06, 07 and src/config.py)
TARGET = "co2"

FEATURES = [
    "year",
    "population_co2",
    "gdp_co2",
    "primary_energy_consumption_energy",
    "fossil_share_energy",
    "renewables_share_energy",
    "renewables_electricity",
    "renewables_share_elec",
    "solar_share_energy",
    "wind_share_energy",
    "hydro_share_energy",
    "gdp_per_capita",
    "energy_per_capita",
]

FEATURE_LABELS = {
    "year": "Year",
    "population_co2": "Population",
    "gdp_co2": "GDP (USD)",
    "primary_energy_consumption_energy": "Primary Energy Consumption (TWh)",
    "fossil_share_energy": "Fossil Fuel Share in Energy (%)",
    "renewables_share_energy": "Renewable Share in Energy (%)",
    "renewables_electricity": "Renewable Electricity (TWh)",
    "renewables_share_elec": "Renewable Share in Electricity (%)",
    "solar_share_energy": "Solar Share in Energy (%)",
    "wind_share_energy": "Wind Share in Energy (%)",
    "hydro_share_energy": "Hydro Share in Energy (%)",
    "gdp_per_capita": "GDP per Capita (USD/person)",
    "energy_per_capita": "Energy per Capita (kWh/person)",
}

FORECAST_LAGS = [1, 2, 3]

# Model Parameters
RANDOM_STATE = 42
GRADIENT_BOOSTING_N_ESTIMATORS = 200
GRADIENT_BOOSTING_LEARNING_RATE = 0.05
GRADIENT_BOOSTING_MAX_DEPTH = 3

FORECASTING_N_ESTIMATORS = 300
FORECASTING_LEARNING_RATE = 0.05
FORECASTING_MAX_DEPTH = 3

# Server & CORS configuration
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    ).split(",")
    if origin.strip()
]