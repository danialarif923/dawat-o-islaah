"""Batch scraper - processes hadiths in small batches to avoid timeouts."""
import re, json, time, os, sys, random
import urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "https://al-hadees.com"
OUTPUT_DIR = r"C:\Users\hp\Desktop\dawat-o-islaah\dawat-o-islaah\scraped_data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

MAX_RETRIES = 3

def fetch(num, slug):
    url = f"{BASE_URL}/{slug}/{num}"
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            })
            resp = urllib.request.urlopen(req, timeout=20)
            return resp.read().decode("utf-8", errors="replace")
        except Exception:
            if attempt < MAX_RETRIES:
                time.sleep(attempt * 3)
    return None

def extract(html, num):
    if not html or len(html) < 200:
        return None
    ar = ""
    m = re.search(rf'<textarea[^>]*[Ii][Dd]="content-arb-{num}"[^>]*>(.*?)</textarea>', html, re.DOTALL)
    if m:
        ar = m.group(1).replace('&#13;&#10;','\n').replace('&#10;','\n').replace('&amp;','&').replace('&lt;','<').replace('&gt;','>').replace('&#039;',"'").replace('&quot;','"').strip()
    ur = ""
    m = re.search(rf'<textarea[^>]*[Ii][Dd]="content-urd-{num}"[^>]*>(.*?)</textarea>', html, re.DOTALL)
    if m:
        ur = m.group(1).replace('&#13;&#10;','\n').replace('&#10;','\n').replace('&amp;','&').replace('&lt;','<').replace('&gt;','>').replace('&#039;',"'").replace('&quot;','"').strip()
    if not ar and not ur:
        return None
    return {"hadith_number": num, "arabic_text": ar, "urdu_text": ur}

def scrape_batch(slug, start, end, workers=8, delay_range=(0.5, 1.5)):
    """Scrape a range of hadith numbers, return list of results."""
    results = []
    lock = Lock()

    def worker(num):
        time.sleep(random.uniform(*delay_range))
        html = fetch(num, slug)
        return extract(html, num)

    todo = list(range(start, end + 1))
    with ThreadPoolExecutor(max_workers=workers) as ex:
        fut_map = {ex.submit(worker, num): num for num in todo}
        for fut in as_completed(fut_map):
            try:
                data = fut.result()
                with lock:
                    if data:
                        results.append(data)
            except Exception:
                pass
    return results

def merge_with_existing(key, new_results):
    path = os.path.join(OUTPUT_DIR, f"{key}.json")
    existing = {}
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            for h in json.load(f):
                existing[h["hadith_number"]] = h
    for h in new_results:
        existing[h["hadith_number"]] = h
    hadiths = sorted(existing.values(), key=lambda x: x["hadith_number"])
    with open(path, "w", encoding="utf-8") as f:
        json.dump(hadiths, f, ensure_ascii=False, indent=2)
    return hadiths

if __name__ == "__main__":
    key = sys.argv[1]
    start = int(sys.argv[2])
    end = int(sys.argv[3])
    workers = int(sys.argv[4]) if len(sys.argv) > 4 else 8
    
    print(f"Batch: {key} #{start}-#{end}, workers={workers}")
    results = scrape_batch(key, start, end, workers=workers)
    hadiths = merge_with_existing(key, results)
    
    with_ur = sum(1 for h in hadiths if h.get("urdu_text"))
    print(f"  Got {len(results)} new, total {len(hadiths)}, with Urdu: {with_ur}")
