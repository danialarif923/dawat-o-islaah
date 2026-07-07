"""
Fast parallel scraper for al-hadees.com
Uses threading + direct URL construction (each page = one hadith).
"""
import re, json, time, os, sys, random
import urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "https://al-hadees.com"
OUTPUT_DIR = r"C:\Users\hp\Desktop\dawat-o-islaah\dawat-o-islaah\scraped_data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Per-book config: slug, known total on al-hadees, resume_from
BOOKS = {
    "mustadrak": {
        "slug": "mustadrak",
        "target_total": 8803,
        "resume_from": 969,
    },
    "darmi": {
        "slug": "sunan-darmi",
        "target_total": 3535,
        "resume_from": 1,
    },
    "darmi_resume": {
        "slug": "sunan-darmi",
        "target_total": 3535,
        "resume_from": 1642,
    },
}

MAX_WORKERS = 15
MIN_DELAY = 0.3
MAX_DELAY = 0.8
MAX_RETRIES = 5
SAVE_EVERY = 200


def fetch_hadith_page(slug, num, session=None, retries=MAX_RETRIES):
    """Fetch a single hadith page. Returns HTML string or None."""
    url = f"{BASE_URL}/{slug}/{num}"
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Referer": f"{BASE_URL}/{slug}/{num-1}",
            })
            resp = urllib.request.urlopen(req, timeout=30)
            return resp.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if attempt < retries:
                wait = 2 ** attempt + random.uniform(0.5, 2)
                time.sleep(wait)
        except Exception as e:
            if attempt < retries:
                wait = 2 ** attempt + random.uniform(0.5, 2)
                time.sleep(wait)
            else:
                return None
    return None


def extract_hadith_data(html, num):
    """Extract arabic and urdu text from a hadith page HTML."""
    if not html or len(html) < 200:
        return None

    arabic = ""
    urdu = ""

    # content-arb-{num}
    m = re.search(rf'<textarea[^>]*[Ii][Dd]="content-arb-{num}"[^>]*>(.*?)</textarea>', html, re.DOTALL)
    if m:
        arabic = clean_text(m.group(1))

    # content-urd-{num}
    m = re.search(rf'<textarea[^>]*[Ii][Dd]="content-urd-{num}"[^>]*>(.*?)</textarea>', html, re.DOTALL)
    if m:
        urdu = clean_text(m.group(1))

    if not arabic and not urdu:
        return None

    return {
        "hadith_number": num,
        "arabic_text": arabic,
        "urdu_text": urdu,
    }


def clean_text(text):
    text = text.replace("&#13;&#10;", "\n").replace("&#10;", "\n")
    text = text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    text = text.replace("&#039;", "'").replace("&quot;", '"')
    return text.strip()


def load_existing(key):
    """Load already scraped hadiths, return dict {number: data}."""
    path = os.path.join(OUTPUT_DIR, f"{key}.json")
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {h["hadith_number"]: h for h in data}


def save_results(key, results_dict):
    """Save results dict to JSON file."""
    path = os.path.join(OUTPUT_DIR, f"{key}.json")
    hadiths = sorted(results_dict.values(), key=lambda h: h["hadith_number"])
    with open(path, "w", encoding="utf-8") as f:
        json.dump(hadiths, f, ensure_ascii=False, indent=2)
    return hadiths


def scrape_book(key):
    config = BOOKS[key]
    slug = config["slug"]
    target = config["target_total"]
    start_num = config["resume_from"]

    existing = load_existing(key)
    print(f"\n{'='*60}")
    print(f"Scraping {key} ({slug})")
    print(f"  Target total (on al-hadees): {target}")
    print(f"  Already have: {len(existing)} hadiths")

    if len(existing) >= target:
        print(f"  Already complete!")
        return

    results = dict(existing)
    lock = Lock()
    saved_count = [0]

    # Count how many we already have from start_num onward
    existing_high = sum(1 for n in range(start_num, target + 1) if n in results)
    print(f"  Need to fetch: {target - len(results)} hadiths (from #{start_num} to #{target})")
    print(f"  Using {MAX_WORKERS} threads, delay {MIN_DELAY}-{MAX_DELAY}s")

    def process(num):
        delay = random.uniform(MIN_DELAY, MAX_DELAY)
        time.sleep(delay)

        html = fetch_hadith_page(slug, num)
        if html is None:
            return num, None

        data = extract_hadith_data(html, num)
        return num, data

    total_to_fetch = target - start_num + 1
    nums_to_fetch = [n for n in range(start_num, target + 1) if n not in results]
    done = 0
    errors = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        fut_map = {executor.submit(process, num): num for num in nums_to_fetch}

        for fut in as_completed(fut_map):
            num = fut_map[fut]
            try:
                n, data = fut.result()
            except Exception as e:
                data = None

            with lock:
                done += 1
                if data:
                    results[n] = data
                else:
                    errors += 1

                if done % 100 == 0 or done == len(nums_to_fetch):
                    pct = done * 100 // len(nums_to_fetch)
                    print(f"  Progress: {done}/{len(nums_to_fetch)} ({pct}%), "
                          f"got={len(results)-len(existing)}, errors={errors}")

                # Periodic save
                if done - saved_count[0] >= SAVE_EVERY or done == len(nums_to_fetch):
                    hadiths = save_results(key, results)
                    saved_count[0] = done
                    ur_count = sum(1 for h in hadiths if h["urdu_text"])
                    print(f"  Saved checkpoint: {len(hadiths)} hadiths, {ur_count} with Urdu")

    hadiths = save_results(key, results)
    ur_count = sum(1 for h in hadiths if h["urdu_text"])
    print(f"\nDone scraping {key}:")
    print(f"  Total: {len(hadiths)}, with Urdu: {ur_count}, errors: {errors}")


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "all"

    if which == "all" or which == "mustadrak":
        scrape_book("mustadrak")

    if which == "all" or which == "darmi":
        scrape_book("darmi")
