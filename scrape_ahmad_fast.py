"""
Fast async scraper for Ahmad Urdu from quranohadith.com/al-hadees.com
Target: 27,400 hadiths in < 1 hour
Strategy: async I/O with aiohttp, 4 domains, concurrent batches
"""
import asyncio, aiohttp, re, json, os, sys

sys.stdout.reconfigure(encoding="utf-8")

OUTPUT_DIR = r"C:\Users\hp\Desktop\dawat-o-islaah\dawat-o-islaah\scraped_data"
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "ahmad.json")

DOMAINS = [
    "https://al-hadees.com",
    "https://quranohadith.com",
    "https://www.quranohadith.com",
]

MAX_CONCURRENT = 30
BATCH_SIZE = 30
SAVE_EVERY = 500
MAX_RETRIES = 4

TOTAL_HADITHS = 27400
START_FROM = 901


def load_existing():
    if not os.path.exists(OUTPUT_FILE):
        return {}, set()
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    result = {}
    for h in data:
        result[h["hadith_number"]] = h
    return result, set(result.keys())


def save_results(results):
    hadiths = sorted(results.values(), key=lambda h: h["hadith_number"])
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(hadiths, f, ensure_ascii=False, indent=2)
    print(f"  SAVED: {len(hadiths)} hadiths", flush=True)
    return hadiths


EXTRACT_RE_ARB = re.compile(r'<textarea[^>]*[Ii][Dd]="content-arb-(\d+)"[^>]*>(.*?)</textarea>', re.DOTALL)
EXTRACT_RE_URD = re.compile(r'<textarea[^>]*[Ii][Dd]="content-urd-(\d+)"[^>]*>(.*?)</textarea>', re.DOTALL)


def extract_hadith_data(html, num):
    if not html or len(html) < 200:
        return None
    arabic = ""
    m = EXTRACT_RE_ARB.search(html)
    if m:
        arabic = m.group(2).replace("&#13;&#10;", "\n").replace("&#10;", "\n")
        arabic = arabic.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
        arabic = arabic.replace("&#039;", "'").replace("&quot;", '"').strip()
    urdu = ""
    m = EXTRACT_RE_URD.search(html)
    if m:
        urdu = m.group(2).replace("&#13;&#10;", "\n").replace("&#10;", "\n")
        urdu = urdu.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
        urdu = urdu.replace("&#039;", "'").replace("&quot;", '"').strip()
    if not arabic and not urdu:
        return None
    return {"hadith_number": num, "arabic_text": arabic, "urdu_text": urdu}


async def fetch_one(session, url, num, retries=MAX_RETRIES):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
    for attempt in range(1, retries + 1):
        try:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status == 404:
                    return None
                if resp.status in (429, 503):
                    await asyncio.sleep(min(2 ** attempt * 2, 20))
                    continue
                return await resp.text(encoding="utf-8", errors="replace")
        except (asyncio.TimeoutError, aiohttp.ClientError):
            if attempt < retries:
                await asyncio.sleep(2 ** attempt)
            else:
                return None
    return None


async def try_fetch(session, num):
    for domain in DOMAINS:
        html = await fetch_one(session, f"{domain}/musnad-ahmed/{num}", num, retries=2)
        if html:
            data = extract_hadith_data(html, num)
            if data:
                return data
    return None


async def process_batch(session, batch):
    tasks = [try_fetch(session, num) for num in batch]
    results = await asyncio.gather(*tasks)
    return [(batch[i], results[i]) for i in range(len(batch))]


async def scrape_all():
    existing, existing_nums = load_existing()
    old_count = len(existing)
    print(f"Existing: {old_count} hadiths", flush=True)

    needed = [n for n in range(START_FROM, TOTAL_HADITHS + 1) if n not in existing_nums]
    print(f"Need to fetch: {len(needed)} hadiths", flush=True)
    print(f"Using {MAX_CONCURRENT} concurrent, batch size {BATCH_SIZE}, {len(DOMAINS)} domains", flush=True)

    if not needed:
        print("Already complete!", flush=True)
        return

    results = dict(existing)
    errors = 0

    connector = aiohttp.TCPConnector(limit=MAX_CONCURRENT, limit_per_host=MAX_CONCURRENT, use_dns_cache=True)

    async with aiohttp.ClientSession(connector=connector) as session:
        for batch_start in range(0, len(needed), BATCH_SIZE):
            batch = needed[batch_start:batch_start + BATCH_SIZE]
            batch_results = await process_batch(session, batch)

            for num, data in batch_results:
                if data:
                    results[num] = data
                else:
                    errors += 1

            done = batch_start + len(batch)
            pct = done * 100 // len(needed)
            ur_count = sum(1 for h in results.values() if h.get("urdu_text"))
            new = len(results) - old_count
            print(f"  {done}/{len(needed)} ({pct}%), total={len(results)}, new={new}, urdu={ur_count}, errors={errors}", flush=True)

            if done - (done // SAVE_EVERY * SAVE_EVERY) >= SAVE_EVERY or done >= len(needed):
                save_results(results)

    save_results(results)
    ur_count = sum(1 for h in results.values() if h.get("urdu_text"))
    print(f"\nDONE: {len(results)} total, {ur_count} with Urdu, {errors} errors", flush=True)


if __name__ == "__main__":
    asyncio.run(scrape_all())
