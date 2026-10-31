import json
import pandas as pd

# Load world atlas
with open('frontend/public/countries-110m.json') as f:
    topo = json.load(f)
geoms = topo['objects']['countries']['geometries']

print(f"Total geometries: {len(geoms)}")
sample_geoms = [(g.get('id'), g.get('properties', {}).get('name')) for g in geoms[:20]]
print("Sample geometries (id, name):", sample_geoms)
