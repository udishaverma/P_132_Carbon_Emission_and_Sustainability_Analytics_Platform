"""
Map Service for loading, caching, and serving full-panel global CO₂ emissions data
for the interactive choropleth map.
"""

from typing import Dict, Any, List, Optional
from pathlib import Path
import pandas as pd
import numpy as np

from backend.app.config import RAW_CO2_DATA_PATH

# Standard ISO 3166-1 alpha-3 to 3-digit numeric string mapping
# Covers all sovereign states and territories recognized internationally
ISO_ALPHA3_TO_NUMERIC: Dict[str, str] = {
    "AFG": "004", "ALB": "008", "DZA": "012", "ASM": "016", "AND": "020", "AGO": "024",
    "AIA": "660", "ATA": "010", "ATG": "028", "ARG": "032", "ARM": "051", "ABW": "533",
    "AUS": "036", "AUT": "040", "AZE": "031", "BHS": "044", "BHR": "048", "BGD": "050",
    "BRB": "052", "BLR": "112", "BEL": "056", "BLZ": "084", "BEN": "204", "BMU": "060",
    "BTN": "064", "BOL": "068", "BES": "535", "BIH": "070", "BWA": "072", "BVT": "074",
    "BRA": "076", "IOT": "086", "BRN": "096", "BGR": "100", "BFA": "854", "BDI": "108",
    "CPV": "132", "KHM": "116", "CMR": "120", "CAN": "124", "CYM": "136", "CAF": "140",
    "TCD": "148", "CHL": "152", "CHN": "156", "CXR": "162", "CCK": "166", "COL": "170",
    "COM": "174", "COG": "178", "COD": "180", "COK": "184", "CRI": "188", "CIV": "384",
    "HRV": "191", "CUB": "192", "CUW": "531", "CYP": "196", "CZE": "203", "DNK": "208",
    "DJI": "262", "DMA": "212", "DOM": "214", "ECU": "218", "EGY": "818", "SLV": "222",
    "GNQ": "226", "ERI": "232", "EST": "233", "SWZ": "748", "ETH": "231", "FLK": "238",
    "FRO": "234", "FJI": "242", "FIN": "246", "FRA": "250", "GUF": "254", "PYF": "258",
    "ATF": "260", "GAB": "266", "GMB": "270", "GEO": "268", "DEU": "276", "GHA": "288",
    "GIB": "292", "GRC": "300", "GRL": "304", "GRD": "308", "GLP": "312", "GUM": "316",
    "GTM": "320", "GGY": "831", "GIN": "324", "GNB": "624", "GUY": "328", "HTI": "332",
    "HMD": "334", "VAT": "336", "HND": "340", "HKG": "344", "HUN": "348", "ISL": "352",
    "IND": "356", "IDN": "360", "IRN": "364", "IRQ": "368", "IRL": "372", "IMN": "833",
    "ISR": "376", "ITA": "380", "JAM": "388", "JPN": "392", "JEY": "832", "JOR": "400",
    "KAZ": "398", "KEN": "404", "KIR": "296", "PRK": "408", "KOR": "410", "KWT": "414",
    "KGZ": "417", "LAO": "418", "LVA": "428", "LBN": "422", "LSO": "426", "LBR": "430",
    "LBY": "434", "LIE": "438", "LTU": "440", "LUX": "442", "MAC": "446", "MDG": "450",
    "MWI": "454", "MYS": "458", "MDV": "462", "MLI": "466", "MLT": "470", "MHL": "584",
    "MTQ": "474", "MRT": "478", "MUS": "480", "MYT": "175", "MEX": "484", "FSM": "583",
    "MDA": "498", "MCO": "492", "MNG": "496", "MNE": "499", "MSR": "500", "MAR": "504",
    "MOZ": "508", "MMR": "104", "NAM": "516", "NRU": "520", "NPL": "524", "NLD": "528",
    "NCL": "540", "NZL": "554", "NIC": "558", "NER": "562", "NGA": "566", "NIU": "570",
    "NFK": "574", "MKD": "807", "MNP": "580", "NOR": "578", "OMN": "512", "PAK": "586",
    "PLW": "585", "PSE": "275", "PAN": "591", "PNG": "598", "PRY": "600", "PER": "604",
    "PHL": "608", "PCN": "612", "POL": "616", "PRT": "620", "PRI": "630", "QAT": "634",
    "REU": "638", "ROU": "642", "RUS": "643", "RWA": "646", "BLM": "652", "SHN": "654",
    "KNA": "659", "LCA": "662", "MAF": "663", "SPM": "666", "VCT": "670", "WSM": "882",
    "SMR": "674", "STP": "678", "SAU": "682", "SEN": "686", "SRB": "688", "SYC": "690",
    "SLE": "694", "SGP": "702", "SXM": "534", "SVK": "703", "SVN": "705", "SLB": "090",
    "SOM": "706", "ZAF": "710", "SGS": "239", "SSD": "728", "ESP": "724", "LKA": "144",
    "SDN": "729", "SUR": "740", "SJM": "744", "SWE": "752", "CHE": "756", "SYR": "760",
    "TWN": "158", "TJK": "762", "TZA": "834", "THA": "764", "TLS": "626", "TGO": "768",
    "TKL": "772", "TON": "776", "TTO": "780", "TUN": "788", "TUR": "792", "TKM": "795",
    "TCA": "796", "TUV": "798", "UGA": "800", "UKR": "804", "ARE": "784", "GBR": "826",
    "USA": "840", "UMI": "581", "URY": "858", "UZB": "860", "VUT": "548", "VEN": "862",
    "VNM": "704", "VGB": "092", "VIR": "850", "WLF": "876", "ESH": "732", "YEM": "887",
    "ZMB": "894", "ZWE": "716", "XKX": "983"
}

# 5-level sequential palette specified by user:
# Lowest: #247A42, Low: #B5CE48, Medium: #F1D34B, High: #ED9237, Highest: #C83D35
TIER_COLORS = [
    "#247A42",  # 0: Lowest emissions (dark green)
    "#B5CE48",  # 1: Low emissions (yellow-green)
    "#F1D34B",  # 2: Medium emissions (yellow)
    "#ED9237",  # 3: High emissions (orange)
    "#C83D35",  # 4: Highest emissions (red)
]

TIER_NAMES = [
    "Lowest Emissions",
    "Low Emissions",
    "Medium Emissions",
    "High Emissions",
    "Highest Emissions"
]


class MapService:
    _instance: Optional["MapService"] = None

    def __init__(self):
        self._raw_df: Optional[pd.DataFrame] = None
        self._cache_by_year: Dict[int, Dict[str, Any]] = {}
        self._load_dataset()

    @classmethod
    def get_instance(cls) -> "MapService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_dataset(self) -> None:
        """Cache the raw OWID dataset in memory once for instant map querying."""
        if not RAW_CO2_DATA_PATH.exists():
            print(f"[MapService] Warning: Raw dataset not found at {RAW_CO2_DATA_PATH}")
            return

        cols_to_use = ["country", "year", "iso_code", "co2"]
        df = pd.read_csv(RAW_CO2_DATA_PATH, usecols=cols_to_use)

        # Exclude aggregate regions and non-country entities:
        # Valid ISO-3 country codes have length 3 and do not start with OWID_
        valid_mask = (
            df["iso_code"].notna() &
            (df["iso_code"].astype(str).str.len() == 3) &
            (~df["iso_code"].astype(str).str.startswith("OWID")) &
            df["co2"].notna()
        )
        self._raw_df = df[valid_mask].copy()
        print(f"[MapService] Cached {len(self._raw_df)} valid country-year emission records.")

    def get_emissions_by_year(self, year: int = 2022) -> Dict[str, Any]:
        """
        Return comprehensive country emissions, quantiles, and geographic identifiers
        for the interactive global choropleth map.
        """
        if year in self._cache_by_year:
            return self._cache_by_year[year]

        if self._raw_df is None or self._raw_df.empty:
            return {
                "year": year,
                "total_countries": 0,
                "thresholds": [],
                "legend": [],
                "countries": {},
                "list": []
            }

        df_year = self._raw_df[self._raw_df["year"] == year].copy()

        # Fall back to latest available year if requested year has no data
        if df_year.empty:
            latest_available = int(self._raw_df["year"].max())
            df_year = self._raw_df[self._raw_df["year"] == latest_available].copy()
            year = latest_available

        # Sort descending by CO2 to compute rank and percentiles
        df_year = df_year.sort_values("co2", ascending=False).reset_index(drop=True)
        n_countries = len(df_year)

        # Calculate exact quintile thresholds (20%, 40%, 60%, 80%)
        co2_values = df_year["co2"].values
        q20, q40, q60, q80 = np.quantile(co2_values, [0.2, 0.4, 0.6, 0.8])
        min_val = float(co2_values.min())
        max_val = float(co2_values.max())

        thresholds = [round(float(q), 2) for q in [q20, q40, q60, q80]]

        legend = [
            {
                "tier": 0,
                "label": TIER_NAMES[0],
                "range": f"≤ {thresholds[0]:.2f} Mt",
                "color": TIER_COLORS[0],
            },
            {
                "tier": 1,
                "label": TIER_NAMES[1],
                "range": f"{thresholds[0]:.2f} – {thresholds[1]:.2f} Mt",
                "color": TIER_COLORS[1],
            },
            {
                "tier": 2,
                "label": TIER_NAMES[2],
                "range": f"{thresholds[1]:.2f} – {thresholds[2]:.2f} Mt",
                "color": TIER_COLORS[2],
            },
            {
                "tier": 3,
                "label": TIER_NAMES[3],
                "range": f"{thresholds[2]:.2f} – {thresholds[3]:.2f} Mt",
                "color": TIER_COLORS[3],
            },
            {
                "tier": 4,
                "label": TIER_NAMES[4],
                "range": f"> {thresholds[3]:.2f} Mt",
                "color": TIER_COLORS[4],
            },
            {
                "tier": -1,
                "label": "No data",
                "range": "No recorded emissions",
                "color": "#E2E9E4",
                "darkColor": "#2D3A34",
            }
        ]

        countries_dict: Dict[str, Any] = {}
        countries_list: List[Dict[str, Any]] = []

        for rank_idx, row in df_year.iterrows():
            rank = int(rank_idx + 1)
            val = float(row["co2"])
            iso3 = str(row["iso_code"]).upper()
            country_name = str(row["country"])
            iso_num = ISO_ALPHA3_TO_NUMERIC.get(iso3, "")

            # Percentile (100% = highest emitting)
            percentile = round(((n_countries - rank) / n_countries) * 100, 1)

            # Classify into quintile tier
            if val <= q20:
                tier = 0
            elif val <= q40:
                tier = 1
            elif val <= q60:
                tier = 2
            elif val <= q80:
                tier = 3
            else:
                tier = 4

            country_data = {
                "country": country_name,
                "iso_code": iso3,
                "iso_num": iso_num,
                "year": year,
                "co2": round(val, 2),
                "rank": rank,
                "total_ranked": n_countries,
                "percentile": percentile,
                "tier": tier,
                "tier_name": TIER_NAMES[tier],
                "color": TIER_COLORS[tier],
            }

            countries_list.append(country_data)
            
            # Index by both iso_num (for world-atlas) and iso3 (for direct lookup)
            if iso_num:
                countries_dict[iso_num] = country_data
            countries_dict[iso3] = country_data

        result = {
            "year": year,
            "total_countries": n_countries,
            "min_emissions": round(min_val, 2),
            "max_emissions": round(max_val, 2),
            "thresholds": thresholds,
            "legend": legend,
            "countries": countries_dict,
            "list": countries_list,
        }

        self._cache_by_year[year] = result
        return result
