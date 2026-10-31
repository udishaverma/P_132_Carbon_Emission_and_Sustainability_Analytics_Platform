"""
Router for Page 1: Overview data.
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.services.data_service import DataService

router = APIRouter(prefix="/overview", tags=["Overview"])


@router.get("")
def get_overview(year: Optional[int] = Query(None, description="Selected year for snapshot (default 2022)")):
    """Return global historical trend, top emitters, latest metrics, and summary."""
    service = DataService.get_instance()
    return service.get_overview_data(year=year)
