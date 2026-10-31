"""
Router for Global CO₂ Emissions Choropleth Map.
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.services.map_service import MapService

router = APIRouter(prefix="/map", tags=["Global Map"])


@router.get("/emissions")
def get_map_emissions(
    year: int = Query(2022, description="Target calendar year for global emissions distribution")
):
    """
    Return global country-level CO₂ emissions, quantile thresholds,
    and geographic identifiers for choropleth map visualization.
    """
    service = MapService.get_instance()
    return service.get_emissions_by_year(year=year)
