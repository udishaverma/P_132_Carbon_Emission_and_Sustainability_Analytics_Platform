"""
Router for Page 2: Data Explorer.
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.services.data_service import DataService

router = APIRouter(prefix="/explorer", tags=["Explorer"])


@router.get("/metrics")
def get_metrics():
    """Return available metrics for exploration."""
    service = DataService.get_instance()
    return {"metrics": service.get_available_metrics()}


@router.get("")
def get_explorer_data(
    country: str = Query("United States", description="Selected country name"),
    metric: str = Query("co2", description="Selected indicator column"),
    start_year: int = Query(2000, description="Start year filter"),
    end_year: int = Query(2022, description="End year filter"),
    comparison_year: int = Query(2022, description="Year for country cross-section comparison"),
):
    """
    Return time series for selected country, comparison bar chart for comparison_year,
    and filtered tabular records.
    """
    service = DataService.get_instance()
    return service.get_explorer_data(
        country=country,
        metric=metric,
        start_year=start_year,
        end_year=end_year,
        comparison_year=comparison_year,
    )
