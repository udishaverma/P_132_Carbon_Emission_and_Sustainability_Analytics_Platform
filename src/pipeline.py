"""
High-level project pipeline orchestration.
"""

from src.data import load_csv
from src.config import MODELING_DATA_PATH


def run_pipeline() -> None:
    """
    Coordinate the high-level project workflow.

    Detailed orchestration will be implemented when the
    existing notebook workflow is migrated into reusable modules.
    """

    # Planned workflow:
    # 1. Load data
    # 2. Validate data
    # 3. Prepare features
    # 4. Train models
    # 5. Evaluate models
    # 6. Generate outputs

    raise NotImplementedError(
        "Pipeline orchestration is planned for the modular implementation phase."
    )