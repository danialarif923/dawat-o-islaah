"""
Local scraper for al-hadees.com
Runs from local machine (not blocked by Cloudflare)
Saves scraped data to JSON files, then upload to server for import
Navigates via "next" links and extracts all hadiths per page.
"""
import re
import json
import time
import urllib.request
import urllib.error
import os
import sys

BOOKS = {
    "ahmad": {"slug": "musnad-ahmed", "name": "musnad-ahmad", "total": 1208, "book_order": 8},
    "darmi": {"slug": "sunan-darmi", "name": "sunan-darimi", "total": 3535, "book_order": 9},
    "malik": {"slug": "imam-malik", "name": "muwatta-malik", "total": 0, "book_order": 10},
    "mustadrak": {"slug": "mustadrak", "name": "mustadrak-al-hakim", "total": 8803, "book_order": 11},
    "ibnkhuzaymah": {"slug": "sahih-ibn-khuzaymah", "name": "sahih-ibn-khuzaymah", "total": 0, "book_order": 12},
}

OUTPUT_DIR = r"C:\Users\hp\Desktop\dawat-o-islaah\dawat-o-islaah\scraped_data"
DEFAULT_DELAY = 0.8
BASE_URL = "https://al-hadees.com"


def fetch_url(url, retries=3):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    })
    for attempt in range(1, retries + 1):
        try:
            resp = urllib.request.urlopen(req, timeout=30)
            html = resp.read().decode("utf-8", errors="replace")
            return html
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if attempt < retries:
                wait = attempt * 2
                print(f"  HTTP {e.code} on {url}, retry {attempt}/{retries} in {wait}s")
                time.sleep(wait)
            else:
                print(f"  HTTP {e.code}: {url}")
                return None
        except Exception as e:
            if attempt < retries:
                wait = attempt * 2
                print(f"  ERROR: {e} on {url}, retry {attempt}/{retries} in {wait}s")
                time.sleep(wait)
            else:
                print(f"  ERROR: {e}: {url}")
                return None
    return None


def extract_hadith_numbers(html):
    """Get all unique hadith numbers from textarea IDs on the page."""
    nums = set()
    for m in re.finditer(r'content-arb-(\d+)', html):
        nums.add(int(m.group(1)))
    # Also check urd IDs
    for m in re.finditer(r'content-urd-(\d+)', html):
        nums.add(int(m.group(1)))
    for m in re.finditer(r'content-eng-(\d+)', html):
        nums.add(int(m.group(1)))
    return sorted(nums)


def extract_textarea_by_id(html, full_id):
    match = re.search(
        rf'<textarea[^>]*[Ii][Dd]="{re.escape(full_id)}"[^>]*>(.*?)</textarea>',
        html, re.DOTALL
    )
    if not match:
        return ""
    text = match.group(1)
    text = text.replace("&#13;&#10;", "\n")
    text = text.replace("&#10;", "\n")
    text = text.replace("&amp;", "&")
    text = text.replace("&lt;", "<")
    text = text.replace("&gt;", ">")
    text = text.replace("&#039;", "'")
    text = text.replace("&quot;", '"')
    return text.strip()


def extract_chapter(html):
    chapter_link = re.search(
        r'<a[^>]*href="https://al-hadees\.com/hadees-subjects/[^"]*"[^>]*>.*?<h[1-3][^>]*>(.*?)</h[1-3]>',
        html, re.DOTALL
    )
    if chapter_link:
        text = re.sub(r'<[^>]+>', '', chapter_link.group(1)).strip()
        text = re.sub(r'\s+', ' ', text)
        if len(text) >= 3:
            return text
    matches = re.findall(r'<h[1-3][^>]*>(.*?)</h[1-3]>', html, re.DOTALL)
    book_titles = {"المستدرك على الصحيحين", "مسند أحمد", "سنن الدارمي", "موطأ مالك", "صحيح ابن خزيمة"}
    for m in matches:
        text = re.sub(r'<[^>]+>', '', m).strip()
        text = re.sub(r'\s+', ' ', text)
        if len(text) >= 5 and any('\u0600' <= c <= '\u06FF' for c in text):
            if text not in book_titles:
                return text
    return ""


def extract_grade(html):
    if "Sahih" in html or "صحيح" in html:
        return "Sahih"
    if "Hasan" in html or "حسن" in html:
        return "Hasan"
    if "Da'if" in html or "Daif" in html or "ضعيف" in html:
        return "Daif"
    return ""


def extract_next_url(html, current_url):
    """Find the next page URL from the current page HTML."""
    patterns = [
        r'<a[^>]*class="[^"]*next[^"]*"[^>]*href="([^"]+)"',
        r'href="([^"]+)"[^>]*class="[^"]*next[^"]*"',
        r'href="([^"]+)"[^>]*>\s*[Nn]ext\s*<',
        r'<a[^>]*>\s*[Nn]ext\s*</a>',
        r'<a[^>]*href="([^"]+)"[^>]*>\s*التالي\s*<',
    ]
    for pat in patterns:
        m = re.search(pat, html)
        if m:
            link = m.group(1)
            if link.startswith("http"):
                return link
            if link.startswith("/"):
                return BASE_URL + link
            return BASE_URL + "/" + link
    return None


def scrape_book(key, delay=DEFAULT_DELAY):
    info = BOOKS[key]
    book_slug = info["slug"]
    book_name = info["name"]

    results = []
    seen_hids = set()
    pages_done = 0

    current_url = f"{BASE_URL}/{book_slug}/1"
    output_file = os.path.join(OUTPUT_DIR, f"{key}.json")
    progress_file = os.path.join(OUTPUT_DIR, f"progress_{key}.txt")

    # Resume from progress
    if os.path.exists(progress_file) and os.path.exists(output_file):
        with open(output_file, "r", encoding="utf-8") as f:
            results = json.load(f)
        for h in results:
            seen_hids.add(h["hadith_number"])
        with open(progress_file, "r") as f:
            current_url = f.read().strip()
        print(f"Resuming from {current_url} (already have {len(results)} hadiths)")

    print(f"Scraping {book_name} ({book_slug})")
    if results:
        print(f"Resuming with {len(results)} existing, starting from {current_url}")

    while current_url:
        html = fetch_url(current_url)
        if html is None:
            print(f"  Failed to fetch {current_url}, stopping")
            break

        if len(html) < 100:
            print(f"  Empty page at {current_url}, stopping")
            break

        # Extract all hadiths on this page
        hadith_nums = extract_hadith_numbers(html)
        new_on_page = 0
        for hid in hadith_nums:
            if hid in seen_hids:
                continue

            arabic = extract_textarea_by_id(html, f"content-arb-{hid}")
            urdu = extract_textarea_by_id(html, f"content-urd-{hid}")
            if not arabic and not urdu:
                continue

            chapter = extract_chapter(html)
            grade = extract_grade(html)

            results.append({
                "hadith_number": hid,
                "chapter_name": chapter,
                "arabic_text": arabic,
                "urdu_text": urdu,
                "grade": grade,
            })
            seen_hids.add(hid)
            new_on_page += 1

        pages_done += 1

        if new_on_page > 0:
            if pages_done == 1 or pages_done % 50 == 0:
                print(f"  Page {pages_done}: {new_on_page} new hadiths (total: {len(results)})")

        # Find next page
        next_url = extract_next_url(html, current_url)
        if next_url and next_url != current_url:
            current_url = next_url
        else:
            print(f"  No next page found, stopping")
            break

        # Save progress
        with open(progress_file, "w") as f:
            f.write(current_url)

        if pages_done % 50 == 0:
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            print(f"  Saved checkpoint ({len(results)} hadiths)")

        if delay:
            time.sleep(delay)

    # Final save
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    if os.path.exists(progress_file):
        os.remove(progress_file)

    print(f"\nDone {book_name}: {len(results)} hadiths across {pages_done} pages")
    print(f"Saved to {output_file}")
    return results


if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    force = "--force" in sys.argv or "-f" in sys.argv
    argv = [a for a in sys.argv if not a.startswith("--") and not a.startswith("-f")]
    which = argv[1] if len(argv) > 1 else "all"

    def run_book(key):
        out = os.path.join(OUTPUT_DIR, f"{key}.json")
        if os.path.exists(out) and not force:
            with open(out, encoding="utf-8") as f:
                existing = json.load(f)
            expected = BOOKS[key]["total"]
            if expected > 0 and len(existing) >= expected * 0.9:
                print(f"Skipping {key}: already has {len(existing)}/{expected} hadiths")
                return
            if expected == 0 and len(existing) > 0:
                print(f"Skipping {key}: already has {len(existing)} hadiths (unknown total)")
                return
        scrape_book(key)

    if which == "all":
        for key in BOOKS:
            run_book(key)
    elif which in BOOKS:
        run_book(which)
    else:
        print(f"Unknown book: {which}")
        print(f"Available: {', '.join(BOOKS.keys())} or 'all'")
