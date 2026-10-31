"""
Router for Model Evaluation and Feature Importance.
"""

from fastapi import APIRouter
from backend.app.services.evaluation_service import EvaluationService

router = APIRouter(prefix="/model", tags=["Model Evaluation"])


@router.get("/evaluation")
def get_evaluation():
    """Return model evaluation metrics across multiple evaluation schemes."""
    service = EvaluationService.get_instance()
    return service.get_full_evaluation()


@router.get("/feature-importance")
def get_feature_importance():
    """Return feature importances from Gradient Boosting."""
    service = EvaluationService.get_instance()
    return {"feature_importance": service.get_feature_importance()}
