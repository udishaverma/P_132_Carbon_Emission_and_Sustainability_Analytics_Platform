"""
Router for Page 5: Renewable Energy Impact.
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.services.impact_service import ImpactService

router = APIRouter(prefix="/renewable-impact", tags=["Renewable Impact"])


@router.get("")
def get_renewable_impact(
    country: Optional[str] = Query(None, description="Country to highlight/filter trend"),
):
    """
    Return renewable energy share vs CO₂ scatter data, adoption groups,
    longitudinal trends, controlled regression coefficients, and correlation metrics.
    """
    service = ImpactService.get_instance()
    return service.get_impact_data(country=country)
