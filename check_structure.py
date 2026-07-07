import json

import sys
sys.stdout.reconfigure(encoding="utf-8")

with open("hadithunlocked_data/darimi.json", "r", encoding="utf-8") as f:
    data = json.load(f)

total_hadiths = 0
for ch in data["chapters"]:
    en_title = ch.get("title", {}).get("en", "?")
    ar_title = ch.get("title", {}).get("ar", "?")
    hadiths = ch.get("hadiths", [])
    print(f"Chapter: {en_title} / {ar_title}, Hadiths: {len(hadiths)}")
    total_hadiths += len(hadiths)
    if hadiths and total_hadiths == len(hadiths):
        h = hadiths[0]
        print(f"  Sample hadith keys: {list(h.keys())}")
        print(f"  ID: {h.get('id')}")
        print(f"  Text (ar) length: {len(h.get('text', {}).get('ar', ''))} chars")
        print(f"  Text (en) length: {len(h.get('text', {}).get('en', ''))} chars")

print(f"\nTotal hadiths: {total_hadiths}")
