"""
Fill only the small English and Urdu gaps from al-hadees.com.
Skips Ahmad Urdu (27k) and Ibn Khuzaymah (both EN/UR) - handled separately.
"""
import json, sys, re, time, random
import urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'https://al-hadees.com'
MERGED_DIR = 'merged_data'

BOOK_SLUGS = {
    'musnad-ahmad': 'musnad-ahmed',
    'sunan-darimi': 'sunan-darmi',
    'muwatta-malik': 'imam-malik',
    'mustadrak-al-hakim': 'mustadrak',
}

def fetch_page(slug, num):
    url = '%s/%s/%d' % (BASE_URL, slug, num)
    for attempt in range(1, 4):
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            })
            resp = urllib.request.urlopen(req, timeout=20)
            return resp.read().decode('utf-8', errors='replace')
        except Exception:
            if attempt < 3:
                time.sleep(attempt * 3)
    return None

def extract_text(html, num, lang):
    if not html or len(html) < 200:
        return None
    pat = r'<textarea[^>]*[Ii][Dd]="content-%s-%d"[^>]*>(.*?)</textarea>' % (lang, num)
    m = re.search(pat, html, re.DOTALL)
    if not m:
        return None
    text = m.group(1)
    for old, new in [('&#13;&#10;','\n'), ('&#10;','\n'), ('&amp;','&'), ('&lt;','<'), ('&gt;','>'), ('&#039;',"'"), ('&quot;','"')]:
        text = text.replace(old, new)
    text = text.strip()
    return text if text else None

def load_merged(bname):
    with open('%s/%s.json' % (MERGED_DIR, bname), 'r', encoding='utf-8') as f:
        return json.load(f)

def save_merged(bname, data):
    with open('%s/%s.json' % (MERGED_DIR, bname), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Build targeted items list (ONLY small gaps, NOT Ahmad Urdu or Ibn Khuzaymah)
items = []
for bname in ['musnad-ahmad', 'sunan-darimi', 'muwatta-malik', 'mustadrak-al-hakim']:
    data = load_merged(bname)
    for h in data['hadiths']:
        n = h['hadith_number']
        # Skip Ahmad Urdu (too many, need other source)
        if bname == 'musnad-ahmad' and not h['urdu_text']:
            continue
        if not h['english_text']:
            items.append((bname, n, 'eng'))
        if not h['urdu_text']:
            items.append((bname, n, 'urd'))

print('Small gaps to fill: %d' % len(items))
if not items:
    print('None found!')
    sys.exit(0)

# Load all data once
all_data = {}
for bname in ['musnad-ahmad', 'sunan-darimi', 'muwatta-malik', 'mustadrak-al-hakim']:
    all_data[bname] = load_merged(bname)

def worker(item):
    bname, num, lang = item
    slug = BOOK_SLUGS.get(bname, bname)
    time.sleep(random.uniform(0.5, 1.5))
    html = fetch_page(slug, num)
    text = extract_text(html, num, lang) if html else None
    return item, text

fetched = 0
success = 0
updated_books = set()

with ThreadPoolExecutor(max_workers=6) as ex:
    fut_map = {ex.submit(worker, item): item for item in items}
    for fut in as_completed(fut_map):
        (bname, num, lang), text = fut.result()
        fetched += 1
        if fetched % 50 == 0:
            print('  Progress: %d/%d (filled %d)' % (fetched, len(items), success))
        if not text:
            continue
        data = all_data[bname]
        for h in data['hadiths']:
            if h['hadith_number'] == num:
                key = 'english_text' if lang == 'eng' else 'urdu_text'
                if not h[key]:
                    h[key] = text
                    success += 1
                break
        updated_books.add(bname)

# Save updated
for bname in updated_books:
    save_merged(bname, all_data[bname])

print('\n=== Results ===')
for bname in ['musnad-ahmad', 'sunan-darimi', 'muwatta-malik', 'mustadrak-al-hakim']:
    data = all_data[bname]
    hs = data['hadiths']
    no_en = sum(1 for h in hs if not h['english_text'])
    no_ur = sum(1 for h in hs if not h['urdu_text'])
    print('  %s: %d hadiths, missing_en=%d, missing_ur=%d' % (bname, len(hs), no_en, no_ur))

# Ibn Khuzaymah status
ik = load_merged('sahih-ibn-khuzaymah')
print('  sahih-ibn-khuzaymah: %d hadiths, missing_en=%d, missing_ur=%d' % (
    len(ik['hadiths']),
    sum(1 for h in ik['hadiths'] if not h['english_text']),
    sum(1 for h in ik['hadiths'] if not h['urdu_text'])))
