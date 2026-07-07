import json, sys
sys.stdout.reconfigure(encoding="utf-8")

with open("hadithunlocked_data/darimi.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Look at full first chapter structure
ch0 = data["chapters"][0]
print("Chapter 0 keys:", list(ch0.keys()))
for k, v in ch0.items():
    if isinstance(v, dict):
        print(f"  {k}: dict with keys {list(v.keys())}")
        for k2, v2 in v.items():
            if isinstance(v2, str):
                print(f"    {k2}: {v2[:100]}")
            elif isinstance(v2, list):
                print(f"    {k2}: list of {len(v2)}")
    elif isinstance(v, list):
        print(f"  {k}: list of {len(v)}")
    elif isinstance(v, str):
        print(f"  {k}: {v[:200]}")
    else:
        print(f"  {k}: {v}")

# Check chapter 1
ch1 = data["chapters"][1]
print("\nChapter 1 keys:", list(ch1.keys()))
print("Chapter 1 sections:", list(ch1.keys()))

# Check if there's a sub-chapters structure
for ch in data["chapters"][:5]:
    if "subChapters" in ch:
        print(f"\nChapter '{ch.get('title', {}).get('en', '?')}' has {len(ch['subChapters'])} subChapters")
        for sc in ch["subChapters"][:2]:
            print(f"  SubChapter keys: {list(sc.keys())}")
            hadiths = sc.get("hadiths", [])
            print(f"  Hadiths in first subChapter: {len(hadiths)}")
            if hadiths:
                print(f"  Sample hadith keys: {list(hadiths[0].keys())}")
                print(f"  ID: {hadiths[0].get('id')}")
    if "sections" in ch:
        print(f"\nChapter '{ch.get('title', {}).get('en', '?')}' has {len(ch['sections'])} sections")
