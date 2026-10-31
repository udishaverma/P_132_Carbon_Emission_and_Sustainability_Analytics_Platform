"""
Time-series forecasting model definitions.
"""

from sklearn.ensemble import GradientBoostingRegressor

from src.config import (
    RANDOM_STATE,
    FORECASTING_N_ESTIMATORS,
    FORECASTING_LEARNING_RATE,
    FORECASTING_MAX_DEPTH,
)


def build_forecasting_model(
    random_state: int = RANDOM_STATE
) -> GradientBoostingRegressor:
    """
    Create the lag-based forecasting model used in the project.

    Returns
    -------
    GradientBoostingRegressor
        Configured Gradient Boosting forecasting model.
    """

    return GradientBoostingRegressor(
        n_estimators=FORECASTING_N_ESTIMATORS,
        learning_rate=FORECASTING_LEARNING_RATE,
        max_depth=FORECASTING_MAX_DEPTH,
        random_state=random_state
    )