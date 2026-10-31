# CO₂ Emissions Analysis & Prediction API

FastAPI REST API foundation for the CO₂ emissions analysis, forecasting, and renewable energy impact platform.

## Features

- **Country Catalog (`GET /api/countries`)**: 79 tracked countries with ISO codes and coverage years.
- **Global Overview (`GET /api/overview`)**: Total emissions, per-capita metrics, top emitters, historical trends, and model summary.
- **Data Explorer (`GET /api/explorer`)**: Filterable country time series, cross-sectional country comparisons, and granular tabular records across 9 environmental and socioeconomic metrics.
- **ML Prediction (`GET /api/prediction/metadata`, `POST /api/prediction`)**: Live inference with Gradient Boosting Regressor (MAE 22.57 Mt, R² 0.9973) across 13 socioeconomic/energy features, plus test set error diagnostics (`/api/prediction/diagnostics`) and historical feature pre-filling (`/api/prediction/country-features`).
- **Forecasting (`GET /api/forecast`)**: Recursive lag-based projections (2023–2027) for individual countries and global totals with explicit assumption disclosures.
- **Renewable Impact (`GET /api/renewable-impact`)**: Scatter plots, quartile adoption groups, longitudinal trends, and controlled multivariate regression coefficients.
- **Model Evaluation (`GET /api/model/evaluation`, `GET /api/model/feature-importance`)**: Transparent metrics for random split, 5-fold grouped cross-validation, and rolling-origin persistence baseline comparisons.

## Running the API

```bash
# From repository root
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation (Swagger UI) is available at:
`http://localhost:8000/docs`
