import json
import pandas as pd

with open("scratch/iso_mapping.json") as f:
    mapping = json.load(f)
num_to_alpha3 = mapping["num_to_alpha3"]
alpha3_to_num = mapping["alpha3_to_num"]

# Load topojson
with open("frontend/public/countries-110m.json") as f:
    topo = json.load(f)
geoms = topo["objects"]["countries"]["geometries"]

# Load OWID co2 data for 2022
df = pd.read_csv("data/raw/owid-co2-data.csv", usecols=["country", "year", "iso_code", "co2"])
df_2022 = df[(df["year"] == 2022) & df["co2"].notna() & (df["iso_code"].str.len() == 3)]
owid_iso3s = set(df_2022["iso_code"].unique())

matched = 0
unmatched_geoms = []

for g in geoms:
    gid = g.get("id")
    name = g.get("properties", {}).get("name")
    
    # Check if gid maps to an alpha3
    alpha3 = num_to_alpha3.get(gid)
    if alpha3 and alpha3 in owid_iso3s:
        matched += 1
    else:
        unmatched_geoms.append((gid, name, alpha3))

print(f"Matched {matched} of {len(geoms)} geometries!")
print(f"Unmatched geometries ({len(unmatched_geoms)}):", unmatched_geoms[:20])
