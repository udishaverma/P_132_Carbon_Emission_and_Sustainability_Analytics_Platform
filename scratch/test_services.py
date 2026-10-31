import sys
from pathlib import Path
sys.path.insert(0, str(Path.cwd()))

from backend.app.services.data_service import DataService
from backend.app.services.model_service import ModelService
from backend.app.services.forecast_service import ForecastService
from backend.app.services.impact_service import ImpactService
from backend.app.services.evaluation_service import EvaluationService
from backend.app.api.prediction import run_prediction
from backend.app.schemas.prediction import PredictionRequest

print("=" * 60)
print("TESTING BACKEND SERVICES")
print("=" * 60)

# 1. DataService
data_svc = DataService.get_instance()
countries = data_svc.get_countries()
print(f"DataService: Loaded {len(countries)} countries.")
overview = data_svc.get_overview_data(2022)
print(f"Overview: Year={overview['selected_year']}, Total CO2={overview['total_co2']} Mt, Per Capita={overview['co2_per_capita']}")
explorer = data_svc.get_explorer_data("United States", "co2", 2000, 2022, 2022)
print(f"Explorer: Returned {len(explorer['time_series'])} points for US, {len(explorer['top_comparisons'])} comparison countries.")

# 2. ModelService
model_svc = ModelService.get_instance()
meta = model_svc.get_metadata()
print(f"ModelService: Best model={meta['selected_model']}, {len(meta['features'])} features.")
diagnostics = model_svc.get_test_diagnostics(limit=50)
print(f"Diagnostics: {len(diagnostics['test_points'])} test points, {len(diagnostics['top_errors'])} top error items.")

# 3. ForecastService
forecast_svc = ForecastService.get_instance()
global_forecast = forecast_svc.get_forecast(None, horizon=5)
print(f"Global Forecast: Chart data points={len(global_forecast['chart_data'])}, Horizon table rows={len(global_forecast['forecast_table'])}")
country_forecast = forecast_svc.get_forecast("India", horizon=5)
print(f"India Forecast: Chart data points={len(country_forecast['chart_data'])}, Forecast 2023={country_forecast['forecast_table'][0]['predicted_co2']} Mt")

# 4. ImpactService
impact_svc = ImpactService.get_instance()
impact_data = impact_svc.get_impact_data("Germany")
print(f"ImpactService: Adoption groups={len(impact_data['adoption_groups'])}, Scatter points={len(impact_data['scatter_points'])}, Regression R2={impact_data['controlled_regression']['r2']}")

# 5. EvaluationService
eval_svc = EvaluationService.get_instance()
eval_data = eval_svc.get_full_evaluation()
print(f"EvaluationService: Primary models={len(eval_data['primary_regression'])}, CV models={len(eval_data['grouped_cross_validation'])}, Baseline comparison={len(eval_data['forecasting_vs_baseline'])}")

# 6. Test Prediction Inference
sample_feat = data_svc.get_country_features("United States", 2022)
print(f"\nRetrieved real US 2022 features: co2 observed = {sample_feat.get('co2', 'N/A')}")
pred_req = PredictionRequest(**sample_feat)
pred_res = run_prediction(pred_req)
print(f"Prediction result for US 2022 vector: {pred_res['predicted_co2']} Mt (Model: {pred_res['model_used']})")

print("\nALL BACKEND SERVICES TESTED AND OPERATIONAL!")
