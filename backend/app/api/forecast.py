"""
Router for Page 4: Time-Series Forecast.
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.services.forecast_service import ForecastService

router = APIRouter(prefix="/forecast", tags=["Forecast"])


@router.get("")
def get_forecast(
    country: Optional[str] = Query(None, description="Country name or omit/World for global panel"),
    horizon: int = Query(5, ge=1, le=5, description="Forecast horizon in years (1 to 5)"),
):
    """
    Return historical vs projected emissions for country or global aggregate,
    along with forecast assumptions and chronological evaluation.
    """
    service = ForecastService.get_instance()
    return service.get_forecast(country=country, horizon=horizon)
