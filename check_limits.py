"""Check how many hadiths each book actually has on al-hadees.com"""
import urllib.request, re

def check_exists(slug, num):
    url = f"https://al-hadees.com/{slug}/{num}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        html = resp.read().decode("utf-8", errors="replace")
        if len(html) < 100:
            return False
        arb_id = f"content-arb-{num}"
        return arb_id in html
    except:
        return False

books = [
    ("musnad-ahmed", [900, 914, 915, 1000, 2000, 5000, 10000]),
    ("sunan-darmi", [3500, 3547, 3600]),
    ("imam-malik", [1900, 1975, 2000]),
    ("mustadrak", [8700, 8803, 8900]),
    ("sahih-ibn-khuzaymah", [2400, 2414, 2500]),
]

for slug, nums in books:
    print(f"\n{slug}:")
    for n in nums:
        exists = check_exists(slug, n)
        print(f"  #{n}: {'EXISTS' if exists else 'EMPTY/404'}")
