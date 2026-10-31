"""
Regression model definitions.
"""

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor
)

from src.config import (
    RANDOM_STATE,
    RANDOM_FOREST_N_ESTIMATORS,
    GRADIENT_BOOSTING_N_ESTIMATORS,
    GRADIENT_BOOSTING_LEARNING_RATE,
    GRADIENT_BOOSTING_MAX_DEPTH,
)


def build_regression_models(
    random_state: int = RANDOM_STATE
) -> dict:
    """
    Create the three regression models used in the project.

    Returns
    -------
    dict
        Dictionary containing the configured regression models.
    """

    return {
        "Linear Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("regressor", LinearRegression())
        ]),

        "Random Forest": RandomForestRegressor(
            n_estimators=RANDOM_FOREST_N_ESTIMATORS,
            random_state=random_state,
            n_jobs=-1
        ),

        "Gradient Boosting": GradientBoostingRegressor(
            n_estimators=GRADIENT_BOOSTING_N_ESTIMATORS,
            learning_rate=GRADIENT_BOOSTING_LEARNING_RATE,
            max_depth=GRADIENT_BOOSTING_MAX_DEPTH,
            random_state=random_state
        )
    }