import json
import urllib.request

# Fetch standard ISO 3166-1 list from github or standard data
url = "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.json"
try:
    with urllib.request.urlopen(url, timeout=5) as resp:
        countries_data = json.loads(resp.read().decode())
    print(f"Loaded {len(countries_data)} countries from ISO standard repository.")
except Exception as e:
    print("Could not load from web:", e)
    countries_data = []

if countries_data:
    alpha3_to_num = {}
    num_to_alpha3 = {}
    for c in countries_data:
        a3 = c.get("alpha-3")
        num = c.get("country-code")
        if a3 and num:
            alpha3_to_num[a3] = num
            num_to_alpha3[num] = a3
    
    with open("scratch/iso_mapping.json", "w") as f:
        json.dump({"alpha3_to_num": alpha3_to_num, "num_to_alpha3": num_to_alpha3}, f, indent=2)
    print("Saved scratch/iso_mapping.json successfully!")
