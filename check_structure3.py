import json, sys
sys.stdout.reconfigure(encoding="utf-8")

with open("hadithunlocked_data/darimi.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Count total hadiths across all sections
total = 0
for ch in data["chapters"]:
    for sec in ch.get("sections", []):
        if "hadiths" in sec:
            total += len(sec["hadiths"])

print(f"Total hadiths across sections: {total}")

# Look at a section with hadiths
found = False
for ch in data["chapters"]:
    for sec in ch.get("sections", []):
        hadiths = sec.get("hadiths", [])
        if hadiths:
            print(f"\nSection keys: {list(sec.keys())}")
            print(f"  Section title: {sec.get('title', {}).get('en', '?')}")
            print(f"  Hadith count in this section: {len(hadiths)}")
            h = hadiths[0]
            print(f"  Sample hadith keys: {list(h.keys())}")
            print(f"  ID: {h.get('id')}")
            print(f"  Number: {h.get('number')}")
            print(f"  Text ar: {h.get('text', {}).get('ar', '')[:200]}")
            print(f"  Text en: {h.get('text', {}).get('en', '')[:200]}")
            print(f"  Chain: {str(h.get('chain', ''))[:200]}")
            found = True
            break
    if found:
        break

# Check for English text availability
en_count = 0
total_hadiths = 0
for ch in data["chapters"]:
    for sec in ch.get("sections", []):
        for h in sec.get("hadiths", []):
            total_hadiths += 1
            if h.get("text", {}).get("en", "").strip():
                en_count += 1

print(f"\nTotal hadiths: {total_hadiths}")
print(f"With English text: {en_count}")
print(f"With Arabic text: {total_hadiths}")  # all should have Arabic
