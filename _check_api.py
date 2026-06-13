import requests, json

# Try gading.dev API (free, no key)
print("=== gading.dev ===")
for book_id in ["bukhari", "muslim", "abu-dawud", "tirmidhi", "nasai", "ibnu-majah"]:
    r = requests.get(f"https://api.hadith.gading.dev/books/{book_id}?range=1-5", timeout=10)
    if r.ok:
        data = r.json()
        chapters = data.get("data", [])
        if chapters:
            ch = chapters[0]
            print(f"  {book_id}: {ch.get('chapter_title')}")
            print(f"    id: {ch.get('id')}")
            print(f"    number: {ch.get('chapter_number')}")
            print(f"    keys: {list(ch.keys())}")
        break
    else:
        print(f"  {book_id}: {r.status_code} {r.text[:100]}")

# Also try the free hadithapi (sunnah.com)
print("\n=== sunnah.com API ===")
r = requests.get("https://api.sunnah.com/v1/collections", timeout=10, headers={"X-API-Key": ""})
print(f"  {r.status_code}")
if r.ok:
    print(json.dumps(r.json(), indent=2)[:500])
