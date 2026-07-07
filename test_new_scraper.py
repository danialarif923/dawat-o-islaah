"""Test the new scraper's pagination logic on a small sample"""
import re
import urllib.request

BASE_URL = "https://al-hadees.com"

def fetch_url(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    resp = urllib.request.urlopen(req, timeout=15)
    return resp.read().decode("utf-8", errors="replace")

def extract_hadith_numbers(html):
    nums = set()
    for m in re.finditer(r'content-arb-(\d+)', html):
        nums.add(int(m.group(1)))
    for m in re.finditer(r'content-urd-(\d+)', html):
        nums.add(int(m.group(1)))
    return sorted(nums)

def extract_next_url(html):
    patterns = [
        r'<a[^>]*class="[^"]*next[^"]*"[^>]*href="([^"]+)"',
        r'href="([^"]+)"[^>]*class="[^"]*next[^"]*"',
        r'href="([^"]+)"[^>]*>\s*[Nn]ext\s*<',
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

# Test each book for pagination flow
for key, slug, pages_to_test in [
    ("mustadrak", "mustadrak", 3),
    ("imam-malik", "imam-malik", 5),
    ("sahih-ibn-khuzaymah", "sahih-ibn-khuzaymah", 5),
    ("musnad-ahmed", "musnad-ahmed", 3),
    ("sunan-darmi", "sunan-darmi", 3),
]:
    print(f"\n{'='*60}")
    print(f"BOOK: {key} ({slug})")
    url = f"{BASE_URL}/{slug}/1"
    page = 0
    while url and page < pages_to_test:
        html = fetch_url(url)
        if not html or len(html) < 100:
            print(f"  Page {page+1}: EMPTY at {url}")
            break
        hids = extract_hadith_numbers(html)
        next_url = extract_next_url(html)
        print(f"  Page {page+1}: {url} -> hadiths={hids}, next={'YES' if next_url else 'NONE'}")
        url = next_url
        page += 1
