"""
Scrape Urdu chapter names from UrduPoint.com and update ur.json.
Maps chapters by English name similarity between UrduPoint and backend data.
"""

import json, re, requests, sys
from bs4 import BeautifulSoup
from difflib import SequenceMatcher

# Mapping: our book slugs -> UrduPoint URL suffix
BOOK_URLS = {
    "sahih-bukhari": "sahih-bukhari",
    "sahih-muslim": "sahih-muslim",
    "abu-dawood": "sunan-abi-dawud",
    "al-tirmidhi": "sunan-at-tirmidhi",
    "ibn-e-majah": "sunan-ibn-e-majah",
    "sunan-nasai": "sunan-nisai",
}

BASE = "https://www.urdupoint.com/islam/hadees-books"

def fetch_page(url):
    r = requests.get(url, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
    r.raise_for_status()
    return r.text

def parse_chapters(html):
    """Parse UrduPoint page and extract list of (number_str, urdu_name, english_name)."""
    soup = BeautifulSoup(html, "lxml")
    chapters = []
    # Find the main table - look for rows with chapter data
    # UrduPoint uses a specific structure: tables with class or in a div
    rows = soup.find_all("tr")
    for row in rows:
        cols = row.find_all("td")
        if len(cols) >= 3:
            num_text = cols[0].get_text(strip=True)
            if not num_text or num_text == "—":
                continue
            # The second column has Urdu name (and possibly English name in a sub-element)
            second_col = cols[1]
            urdu = ""
            english = ""
            # Find the main Urdu text - it's the direct text or in a specific element
            spans = second_col.find_all("span")
            divs = second_col.find_all("div")
            # Get the Urdu text (usually the main text before the English)
            full_text = second_col.get_text("\n", strip=True)
            # Urdu text is first line, English is second
            parts = [p for p in full_text.split("\n") if p.strip()]
            if len(parts) >= 2:
                # Usually: "بدء الوحى - وحی کے بیان میں" then "The Book Of Revelation"
                urdu = parts[0]
                english = parts[1]
            elif len(parts) == 1:
                urdu = parts[0]
                english = parts[0]

            # Extract actual number (handle "--", "1ق", "6م" etc.)
            number = num_text.replace("ق", "").replace("م", "").strip()
            if number and number != "--":
                try:
                    num = int(number)
                    # Skip sub-chapters with suffixes
                    is_sub = "ق" in num_text or "م" in num_text
                    chapters.append({
                        "num": num,
                        "num_raw": num_text,
                        "urdu": urdu,
                        "english": english,
                        "is_sub": is_sub,
                    })
                except ValueError:
                    pass
    return chapters

def load_current_urjson():
    with open("assets/languages/ur.json", "r", encoding="utf-8") as f:
        return json.load(f)

def save_urjson(data):
    with open("assets/languages/ur.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_backend_chapters_from_urjson(data, book_slug):
    """Extract backend chapter info from ur.json for a given book."""
    prefix = f"hadithChapterNames.{book_slug}."
    chapters = {}
    for key, val in data.items():
        if key.startswith(prefix):
            num_str = key[len(prefix):]
            try:
                num = int(num_str)
                chapters[num] = {"key": key, "urdu": val or ""}
            except ValueError:
                pass
    return chapters

def match_chapters(backend_chapters, scraped_chapters, book_slug):
    """
    Match scraped chapters to backend chapters based on English name similarity.
    Returns list of (backend_num, urdu_text) for chapters that need updating.
    """
    updates = {}
    used_scraped = set()

    # For each backend chapter, find the best match among scraped chapters
    for bnum, binfo in backend_chapters.items():
        if binfo["urdu"]:
            continue  # Already has Urdu

        # We don't have the backend's English name in ur.json, so 
        # we'll match by chapter number directly (most books have matching numbers)
        for sc in scraped_chapters:
            if sc["num"] in used_scraped:
                continue
            if sc["num"] == bnum and not sc["is_sub"]:
                updates[bnum] = sc["urdu"]
                used_scraped.add(sc["num"])
                break

    return updates

def main():
    ur_data = load_current_urjson()
    total_updated = 0

    for book_slug, url_suffix in BOOK_URLS.items():
        print(f"\n=== {book_slug} ===")
        url = f"{BASE}/{url_suffix}.html"
        try:
            html = fetch_page(url)
        except Exception as e:
            print(f"  FAILED to fetch: {e}")
            continue

        scraped = parse_chapters(html)
        print(f"  Scraped {len(scraped)} chapters from UrduPoint")

        backend_chs = get_backend_chapters_from_urjson(ur_data, book_slug)
        print(f"  Backend has {len(backend_chs)} chapters")

        # Find which backend chapters need Urdu
        missing = {n: info for n, info in backend_chs.items() if not info["urdu"]}
        print(f"  Missing Urdu: {len(missing)} chapters")

        if not missing:
            print(f"  All chapters have Urdu!")
            continue

        # Try to match by number AND by English name
        # First pass: direct number match
        updates = match_chapters(missing, scraped, book_slug)
        
        if updates:
            print(f"  Found {len(updates)} matches by number:")
            for num, urdu in sorted(updates.items()):
                print(f"    Chapter {num}: {urdu[:60]}")
                key = f"hadithChapterNames.{book_slug}.{num}"
                if key in ur_data:
                    ur_data[key] = urdu
                    total_updated += 1
                else:
                    print(f"    WARNING: key {key} not found in ur.json")
        else:
            print(f"  No matches found. Debug info:")
            print(f"    Backend missing chapters: {sorted(missing.keys())}")
            scraped_nums = sorted(set(s["num"] for s in scraped))
            print(f"    Scraped chapter numbers: {scraped_nums}")

    save_urjson(ur_data)
    print(f"\n=== Done! Updated {total_updated} chapters ===")

if __name__ == "__main__":
    main()
