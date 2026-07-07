import json
for fname in ["sunan-darimi.json", "muwatta-malik.json", "mustadrak-al-hakim.json", "sahih-ibn-khuzaymah.json", "musnad-ahmad.json"]:
    with open(f"merged_data/{fname}", encoding="utf-8") as f:
        d = json.load(f)
    chaps = set()
    for h in d["hadiths"]:
        chaps.add((h["chapter_english"], h["chapter_arabic"]))
    print(f"=== {fname} ===")
    print(f"  Total chapters: {len(chaps)}")
    for i, (en, ar) in enumerate(sorted(chaps)):
        if i < 5:
            en_preview = en[:40] if en else "(empty)"
            ar_status = "(has_arabic)" if ar else "(no_arabic)"
            print(f"  {en_preview} | {ar_status}")
    print()
