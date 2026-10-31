"""
Visualization functions for model evaluation and analysis.
"""

import matplotlib.pyplot as plt


def save_plot(
    output_path,
    title: str
) -> None:
    """Save and close the current matplotlib figure."""
    plt.title(title)
    plt.tight_layout()
    plt.savefig(
        output_path,
        dpi=300,
        bbox_inches="tight"
    )
    plt.close()