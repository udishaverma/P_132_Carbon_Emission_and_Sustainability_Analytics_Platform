"""
Main FastAPI application entry point for the CO₂ Analytics & Prediction Platform.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import CORS_ORIGINS
from backend.app.services.data_service import DataService
from backend.app.services.model_service import ModelService
from backend.app.services.forecast_service import ForecastService
from backend.app.services.impact_service import ImpactService
from backend.app.services.evaluation_service import EvaluationService
from backend.app.services.map_service import MapService

from backend.app.api.countries import router as countries_router
from backend.app.api.overview import router as overview_router
from backend.app.api.explorer import router as explorer_router
from backend.app.api.prediction import router as prediction_router
from backend.app.api.forecast import router as forecast_router
from backend.app.api.renewable_impact import router as renewable_impact_router
from backend.app.api.evaluation import router as evaluation_router
from backend.app.api.map import router as map_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up singleton services on startup
    print("Initializing services...")
    DataService.get_instance()
    ModelService.get_instance()
    ForecastService.get_instance()
    ImpactService.get_instance()
    EvaluationService.get_instance()
    MapService.get_instance()
    print("All backend services initialized successfully.")
    yield


app = FastAPI(
    title="CO₂ Emissions Analytics & Prediction API",
    description="REST API for exploring emissions, running ML predictions, generating forecasts, and analyzing renewable energy impact.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend Vite dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development or specify CORS_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(countries_router, prefix="/api")
app.include_router(overview_router, prefix="/api")
app.include_router(explorer_router, prefix="/api")
app.include_router(prediction_router, prefix="/api")
app.include_router(forecast_router, prefix="/api")
app.include_router(renewable_impact_router, prefix="/api")
app.include_router(evaluation_router, prefix="/api")
app.include_router(map_router, prefix="/api")


@app.get("/api/health")
def health_check():
    """Health check endpoint to verify backend operational readiness."""
    data_svc = DataService.get_instance()
    model_svc = ModelService.get_instance()
    forecast_svc = ForecastService.get_instance()

    return {
        "status": "healthy",
        "service": "CO₂ Emissions Analysis & ML API",
        "data_loaded": data_svc.modeling_df is not None,
        "countries_count": len(data_svc.get_countries()),
        "models_ready": list(model_svc.models.keys()),
        "forecasting_ready": forecast_svc.model is not None,
    }


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Clean global error handler preventing stack trace leaks."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if "development" in app.title.lower() else "An unexpected error occurred. Please verify your request parameters.",
        },
    )
