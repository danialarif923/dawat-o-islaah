import json, sys

for fname in ["musnad-ahmad.json", "sunan-darimi.json", "muwatta-malik.json", "mustadrak-al-hakim.json", "sahih-ibn-khuzaymah.json"]:
    with open(f"merged_data/{fname}", encoding="utf-8") as f:
        data = json.load(f)
    total = len(data["hadiths"])
    with_ch = sum(1 for h in data["hadiths"] if h["chapter_arabic"] or h["chapter_english"])
    unique_ar = len(set(h["chapter_arabic"] for h in data["hadiths"] if h["chapter_arabic"]))
    unique_en = len(set(h["chapter_english"] for h in data["hadiths"] if h["chapter_english"]))
    print(f"{fname}: {total} total, {with_ch} with chapters, {unique_ar} unique ar, {unique_en} unique en")
    # show first 3 non-empty chapter names (ascii only)
    for h in data["hadiths"]:
        if h["chapter_english"]:
            en_ascii = h["chapter_english"].encode("ascii", "replace").decode("ascii")
            print(f"  e.g.: #{h['hadith_number']} en={en_ascii[:60]}")
            break
    if not with_ch:
        print("  NO CHAPTERS!")
    print()
