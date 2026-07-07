import json, sys, os
sys.stdout.reconfigure(encoding="utf-8")

for bookname in ["ahmad.json", "hakim.json"]:
    path = os.path.join("hadithunlocked_data", bookname)
    size = os.path.getsize(path)
    
    # Check if JSON is valid by reading last few bytes
    with open(path, "rb") as f:
        f.seek(0, 2)
        end = f.tell()
        f.seek(max(0, end - 100))
        tail = f.read()
    
    # Check if file ends with proper JSON
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        print(f"{bookname}: VALID, size={size}")
        # count
        total = 0
        for ch in data.get("chapters", []):
            for sec in ch.get("sections", []):
                total += len(sec.get("items", []))
        print(f"  Hadiths: {total}")
    except json.JSONDecodeError as e:
        print(f"{bookname}: INVALID - {e}, size={size}")
        print(f"  Last 100 bytes (raw): {tail[:100]!r}")
    except Exception as e:
        print(f"{bookname}: ERROR - {e}, size={size}")
