import json, sys, os
sys.stdout.reconfigure(encoding="utf-8")

for bookname in ["hakim.json", "darimi.json", "malik.json", "ibnkhuzaymah.json"]:
    path = os.path.join("hadithunlocked_data", bookname)
    if not os.path.exists(path):
        print(f"{bookname}: NOT FOUND")
        continue
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"{bookname}: ERROR - {e}")
        continue
    
    total = 0
    arabic = 0
    english = 0
    for ch in data.get("chapters", []):
        for sec in ch.get("sections", []):
            for h in sec.get("items", []):
                total += 1
                text = h.get("text", {})
                if text.get("ar", "").strip():
                    arabic += 1
                if text.get("en", "").strip():
                    english += 1
    print(f"{bookname}: total={total}, ar={arabic}, en={english}")
