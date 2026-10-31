"""
Data loading and validation functions.
"""

from pathlib import Path
import pandas as pd


def load_csv(path: Path) -> pd.DataFrame:
    """Load a CSV file into a DataFrame."""
    return pd.read_csv(path)


def validate_required_columns(
    df: pd.DataFrame,
    required_columns: list[str]
) -> None:
    """Validate that required columns are present."""
    missing = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            f"Missing required columns: {missing}"
        )


def validate_no_missing_values(
    df: pd.DataFrame,
    columns: list[str]
) -> None:
    """Validate that required columns contain no missing values."""
    if df[columns].isna().any().any():
        raise ValueError(
            "Missing values found in required columns."
        )