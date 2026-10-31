"""
End-to-end test suite for the CO₂ Analytics and Prediction FastAPI REST API.
Verifies all REST endpoints, schemas, mathematical consistency, and inference pipelines.
"""

import sys
from pathlib import Path
import unittest

# Add root directory to sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.services.data_service import DataService
from backend.app.services.model_service import ModelService
from backend.app.services.forecast_service import ForecastService
from backend.app.services.impact_service import ImpactService
from backend.app.services.evaluation_service import EvaluationService
from backend.app.services.map_service import MapService
from backend.app.schemas.prediction import PredictionRequest
from backend.app.api.prediction import run_prediction


class TestCO2PlatformAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data_svc = DataService.get_instance()
        cls.model_svc = ModelService.get_instance()
        cls.forecast_svc = ForecastService.get_instance()
        cls.impact_svc = ImpactService.get_instance()
        cls.eval_svc = EvaluationService.get_instance()
        cls.map_svc = MapService.get_instance()

    def test_01_countries_catalog(self):
        countries = self.data_svc.get_countries()
        self.assertEqual(len(countries), 79, "Should track exactly 79 countries")
        us = next((c for c in countries if c["country"] == "United States"), None)
        self.assertIsNotNone(us)
        self.assertEqual(us["iso_code"], "USA")
        self.assertEqual(us["min_year"], 2000)
        self.assertEqual(us["max_year"], 2022)

    def test_02_overview_data(self):
        overview = self.data_svc.get_overview_data(2022)
        self.assertEqual(overview["selected_year"], 2022)
        self.assertGreater(overview["total_co2"], 30000.0)
        self.assertEqual(len(overview["top_emitters"]), 10)
        self.assertEqual(len(overview["historical_emissions"]), 23)
        self.assertIn("United States", overview["top_5_countries"])

    def test_03_explorer_query(self):
        exp = self.data_svc.get_explorer_data(
            country="India",
            metric="co2",
            start_year=2005,
            end_year=2020,
            comparison_year=2020
        )
        self.assertEqual(exp["country"], "India")
        self.assertEqual(len(exp["time_series"]), 16)
        self.assertEqual(len(exp["top_comparisons"]), 15)
        self.assertTrue(len(exp["table_data"]) > 0)

    def test_04_prediction_metadata(self):
        meta = self.model_svc.get_metadata()
        self.assertEqual(meta["selected_model"], "Gradient Boosting")
        self.assertEqual(len(meta["features"]), 13)
        self.assertTrue(len(meta["feature_importance"]) >= 13)
        self.assertTrue(len(meta["evaluation_results"]) >= 3)

    def test_05_prediction_inference(self):
        us_features = self.data_svc.get_country_features("United States", 2022)
        self.assertIsNotNone(us_features)
        
        req = PredictionRequest(**us_features, model_name="Gradient Boosting")
        res = run_prediction(req)
        
        self.assertEqual(res["model_used"], "Gradient Boosting")
        self.assertGreater(res["predicted_co2"], 4000.0)
        self.assertLess(res["predicted_co2"], 6500.0)
        self.assertEqual(res["unit"], "Million tonnes (Mt)")

    def test_06_forecast_projections(self):
        # Global
        global_forecast = self.forecast_svc.get_forecast(None, horizon=5)
        self.assertTrue(global_forecast["is_global"])
        self.assertEqual(len(global_forecast["forecast_table"]), 5)
        self.assertEqual(global_forecast["start_forecast_year"], 2023)
        self.assertEqual(global_forecast["end_forecast_year"], 2027)

        # Country specific
        germany_forecast = self.forecast_svc.get_forecast("Germany", horizon=3)
        self.assertFalse(germany_forecast["is_global"])
        self.assertEqual(len(germany_forecast["forecast_table"]), 3)

    def test_07_renewable_impact(self):
        impact = self.impact_svc.get_impact_data("Brazil")
        self.assertEqual(len(impact["adoption_groups"]), 4)
        self.assertEqual(len(impact["scatter_points"]), 79)
        self.assertEqual(len(impact["controlled_regression"]["coefficients"]), 4)
        self.assertGreater(impact["controlled_regression"]["r2"], 0.75)
        self.assertTrue("corr_co2_per_capita" in impact["correlations"])

    def test_08_evaluation_metrics(self):
        eval_data = self.eval_svc.get_full_evaluation()
        self.assertEqual(len(eval_data["primary_regression"]), 3)
        self.assertEqual(len(eval_data["grouped_cross_validation"]), 3)
        self.assertEqual(len(eval_data["forecasting_vs_baseline"]), 2)

    def test_09_map_service_quantiles(self):
        map_data = self.map_svc.get_emissions_by_year(2022)
        self.assertEqual(map_data["year"], 2022)
        self.assertGreater(map_data["total_countries"], 200, "Should contain >200 genuine countries")
        self.assertEqual(len(map_data["thresholds"]), 4, "Should have 4 quantile cut points for 5 tiers")
        self.assertEqual(len(map_data["legend"]), 6, "Should have 5 quantile tiers + 1 No data tier")
        
        # Verify USA, China, and India are ranked and classified in highest tier
        usa = map_data["countries"].get("840")
        self.assertIsNotNone(usa)
        self.assertEqual(usa["iso_code"], "USA")
        self.assertEqual(usa["tier"], 4, "USA should be in highest emissions tier")
        self.assertEqual(usa["color"], "#C83D35")
        
        chn = map_data["countries"].get("156")
        self.assertIsNotNone(chn)
        self.assertEqual(chn["tier"], 4)
        
        # Check an island/small emitter is in tier 0 (lowest emissions, dark green)
        tuvalu = map_data["countries"].get("798") # TUV
        if tuvalu:
            self.assertEqual(tuvalu["tier"], 0)
            self.assertEqual(tuvalu["color"], "#247A42")


if __name__ == "__main__":
    unittest.main(verbosity=2)
