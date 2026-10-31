"""
Pydantic schemas for regression prediction requests and responses.
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    # Support both a dictionary of features or explicit features
    year: float = Field(..., description="Target year for prediction", ge=1990, le=2050)
    population_co2: float = Field(..., description="Population count", ge=1000)
    gdp_co2: float = Field(..., description="GDP in USD", ge=0)
    primary_energy_consumption_energy: float = Field(..., description="Primary energy consumption in TWh", ge=0)
    fossil_share_energy: float = Field(..., description="Fossil fuel share in %", ge=0, le=100)
    renewables_share_energy: float = Field(..., description="Renewable energy share in %", ge=0, le=100)
    renewables_electricity: float = Field(..., description="Renewable electricity in TWh", ge=0)
    renewables_share_elec: float = Field(..., description="Renewable share in electricity %", ge=0, le=100)
    solar_share_energy: float = Field(..., description="Solar share in %", ge=0, le=100)
    wind_share_energy: float = Field(..., description="Wind share in %", ge=0, le=100)
    hydro_share_energy: float = Field(..., description="Hydro share in %", ge=0, le=100)
    gdp_per_capita: float = Field(..., description="GDP per capita in USD", ge=0)
    energy_per_capita: float = Field(..., description="Energy per capita in kWh/person", ge=0)
    model_name: Optional[str] = Field(default="Gradient Boosting", description="Model algorithm to use")


class PredictionResponse(BaseModel):
    model_used: str
    predicted_co2: float
    raw_prediction: float
    unit: str
    features_used: Dict[str, float]
    note: str
