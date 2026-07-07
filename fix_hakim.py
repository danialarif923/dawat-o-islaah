import json, re, sys
sys.stdout.reconfigure(encoding="utf-8")

path = "hadithunlocked_data/hakim.json"
with open(path, "rb") as f:
    raw = f.read()

# Try to decode, removing invalid control characters
# The issue is likely control characters within string values
decoded = raw.decode("utf-8", errors="replace")

# Replace control characters (except \n, \r, \t) in the JSON
# JSON allows \n, \r, \t but not other control characters in strings
cleaned = []
for ch in decoded:
    if ord(ch) < 32 and ch not in "\n\r\t":
        cleaned.append(" ")  # replace with space
    else:
        cleaned.append(ch)
cleaned = "".join(cleaned)

# Now parse
try:
    data = json.loads(cleaned)
    print(f"Successfully parsed! Type: {type(data).__name__}")
    
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
    print(f"Total hadiths: {total}")
    print(f"With Arabic: {arabic}")
    print(f"With English: {english}")
    
    # Save cleaned version
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    print("Cleaned file saved")
except json.JSONDecodeError as e:
    print(f"Still fails: {e}")
    # Find the problematic area
    pos = e.pos
    print(f"Around position {pos}: ...{decoded[max(0,pos-100):pos+100]}...")
except Exception as e:
    print(f"Error: {e}")
