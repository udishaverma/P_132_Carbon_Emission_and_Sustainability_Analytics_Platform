"""
Router for Page 3: Regression Prediction.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.services.model_service import ModelService
from backend.app.services.data_service import DataService
from backend.app.schemas.prediction import PredictionRequest, PredictionResponse

router = APIRouter(prefix="/prediction", tags=["Prediction"])


@router.get("/metadata")
def get_prediction_metadata():
    """Return feature definitions, ranges, evaluation summary, and model params."""
    service = ModelService.get_instance()
    return service.get_metadata()


@router.get("/diagnostics")
def get_prediction_diagnostics(limit: int = Query(200, ge=10, le=500)):
    """Return test set actual vs predicted points, residuals, and largest error cases."""
    service = ModelService.get_instance()
    return service.get_test_diagnostics(limit=limit)


@router.get("/country-features")
def get_country_features(
    country: str = Query("United States", description="Country name to fetch features for"),
    year: int = Query(2022, description="Year to fetch features for"),
):
    """Retrieve actual historical features for pre-filling the prediction form."""
    data_service = DataService.get_instance()
    features = data_service.get_country_features(country=country, year=year)
    if not features:
        raise HTTPException(
            status_code=404,
            detail=f"No recorded feature data for '{country}' in year {year}."
        )
    return {"country": country, "year": year, "features": features}


@router.post("", response_model=PredictionResponse)
def run_prediction(payload: PredictionRequest):
    """Run regression model inference on the provided feature vector."""
    service = ModelService.get_instance()
    feature_dict = payload.model_dump()
    model_name = feature_dict.pop("model_name", None)

    try:
        result = service.predict(feature_dict, model_name=model_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
