"""
Feature engineering functions.
"""

import pandas as pd

from src.config import FORECAST_LAGS


def create_regression_features(
    df: pd.DataFrame,
    feature_columns: list[str]
) -> pd.DataFrame:
    """
    Return the selected regression features.
    """
    return df[feature_columns].copy()


def add_co2_lags(
    df: pd.DataFrame,
    lags: list[int] | None = None
) -> pd.DataFrame:
    """
    Create country-specific CO₂ lag features.

    Parameters
    ----------
    df : pandas.DataFrame
        Input dataset containing country, year and co2 columns.

    lags : list[int] | None
        Lag values to create. If None, the project's configured
        forecasting lags are used.

    Returns
    -------
    pandas.DataFrame
        Dataset containing the requested country-specific lag features.
    """

    if lags is None:
        lags = FORECAST_LAGS.copy()

    result = df.sort_values(
        ["country", "year"]
    ).copy()

    for lag in lags:
        result[f"co2_lag_{lag}"] = (
            result.groupby("country")["co2"].shift(lag)
        )

    return result