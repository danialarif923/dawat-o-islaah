import json, sys
sys.stdout.reconfigure(encoding="utf-8")

with open("hadithunlocked_data/darimi.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Deep search for any field that might have hadiths
def search_keys(obj, depth=0, max_depth=5):
    if depth > max_depth:
        return
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, list):
                if len(v) > 0:
                    print(f"{'  '*depth}{k}: list of {len(v)}")
                    if isinstance(v[0], dict):
                        if "text" in v[0] or "id" in v[0]:
                            print(f"{'  '*depth}  -> has text/id, keys: {list(v[0].keys())}")
            elif isinstance(v, dict):
                if "text" in v or "id" in v:
                    print(f"{'  '*depth}{k}: dict with text/id")
                else:
                    sub = search_keys(v, depth+1, max_depth)
        return True
    return False

print("=== First chapter full structure ===")
ch0 = data["chapters"][0]
search_keys(ch0, 0, 4)

# Also look at second chapter
print("\n=== Chapter 1 (Book of Purification) ===")
ch1 = data["chapters"][1]
search_keys(ch1, 0, 4)

# Look at first section of first book chapter
print("\n=== First section of chapter 1 ===")
sec0 = ch1["sections"][0]
print(json.dumps(sec0, indent=2, ensure_ascii=False)[:2000])
