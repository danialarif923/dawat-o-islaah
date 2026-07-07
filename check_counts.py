import json, sys, os
sys.stdout.reconfigure(encoding="utf-8")

books = ["darimi.json", "malik.json", "ibnkhuzaymah.json", "ahmad.json", "hakim.json"]
datadir = "hadithunlocked_data"

for bookname in books:
    path = os.path.join(datadir, bookname)
    if not os.path.exists(path):
        print(f"{bookname}: FILE NOT FOUND")
        continue
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, Exception) as e:
        print(f"{bookname}: parse error - {e}")
        continue

    total = 0
    arabic_count = 0
    english_count = 0
    has_chain_ar = 0
    has_chain_en = 0

    for ch in data.get("chapters", []):
        for sec in ch.get("sections", []):
            for h in sec.get("items", []):
                total += 1
                text = h.get("text", {})
                if text.get("ar", "").strip():
                    arabic_count += 1
                if text.get("en", "").strip():
                    english_count += 1
                chain = h.get("chain", {})
                if chain.get("ar", "").strip():
                    has_chain_ar += 1
                if chain.get("en", "").strip():
                    has_chain_en += 1

    print(f"{bookname}:")
    print(f"  Total hadiths: {total}")
    print(f"  With Arabic text: {arabic_count}")
    print(f"  With English text: {english_count}")
    print(f"  With Arabic chain: {has_chain_ar}")
    print(f"  With English chain: {has_chain_en}")
    print()
