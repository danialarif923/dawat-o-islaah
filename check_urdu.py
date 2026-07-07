import json

with open("scraped_data/ahmad.json", "r", encoding="utf-8") as f:
    scraped = json.load(f)
print(f"Ahmad scraped: {len(scraped)} hadiths")
if scraped:
    print(f"  Sample keys: {list(scraped[0].keys())}")
    print(f"  First hadith_number: {scraped[0].get('hadith_number')}")
    print(f"  Last hadith_number: {scraped[-1].get('hadith_number')}")

# Check new merged
with open("merged_data/musnad-ahmed.json", "r", encoding="utf-8") as f:
    data = json.load(f)
print(f"\nAhmad new merged: {len(data)} total")
urdu_count = sum(1 for h in data if h["HadithUrdu"])
print(f"  With Urdu: {urdu_count}")

# Check merged mustadrak
with open("merged_data/mustadrak.json", "r", encoding="utf-8") as f:
    data = json.load(f)
print(f"\nMustadrak new merged: {len(data)} total")
urdu_count = sum(1 for h in data if h["HadithUrdu"])
print(f"  With Urdu: {urdu_count}")
# Show first few with Urdu
for h in data:
    if h["HadithUrdu"]:
        print(f"  Hadith {h['HadithNumber']}: Urdu={h['HadithUrdu'][:80]}...")
        break
