"""
Central project configuration.

Stores shared paths, feature definitions, model parameters,
forecasting settings and reproducibility configuration.
"""

from pathlib import Path


# ============================================================
# Reproducibility
# ============================================================

RANDOM_STATE = 42


# ============================================================
# Project Paths
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

OUTPUT_DIR = PROJECT_ROOT / "outputs"
VISUALIZATION_DIR = PROJECT_ROOT / "visualizations"

MODELING_DATA_PATH = PROCESSED_DATA_DIR / "modeling_data.csv"


# ============================================================
# Target Variable
# ============================================================

TARGET = "co2"


# ============================================================
# Regression Features
# ============================================================

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


# ============================================================
# Forecasting Features
# ============================================================

FORECAST_LAGS = [1, 2, 3]


# ============================================================
# Regression Model Configuration
# ============================================================

RANDOM_FOREST_N_ESTIMATORS = 300

GRADIENT_BOOSTING_N_ESTIMATORS = 200
GRADIENT_BOOSTING_LEARNING_RATE = 0.05
GRADIENT_BOOSTING_MAX_DEPTH = 3


# ============================================================
# Forecasting Model Configuration
# ============================================================

FORECASTING_N_ESTIMATORS = 300
FORECASTING_LEARNING_RATE = 0.05
FORECASTING_MAX_DEPTH = 3