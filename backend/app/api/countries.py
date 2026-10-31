"""
Router for country listing and metadata.
"""

from fastapi import APIRouter
from backend.app.services.data_service import DataService

router = APIRouter(prefix="/countries", tags=["Countries"])


@router.get("")
def get_countries():
    """Return all 79 tracked countries with ISO code, year span, and latest values."""
    service = DataService.get_instance()
    countries = service.get_countries()
    return {
        "count": len(countries),
        "countries": countries,
    }
