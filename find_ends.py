"""Binary search for the actual last hadith of each book"""
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

def find_last(slug, start, high):
    """Binary search to find the last existing hadith"""
    low = start
    while low < high:
        mid = (low + high + 1) // 2
        exists = check_exists(slug, mid)
        if exists:
            low = mid
        else:
            high = mid - 1
    return low

# For each book, find a safe upper bound then binary search
books_info = [
    ("musnad-ahmed", 914, 2000, 10),
    ("sunan-darmi", 3500, 3600, 10),
    ("imam-malik", 1, 1900, 10),
    ("mustadrak", 8803, 8900, 10),
    ("sahih-ibn-khuzaymah", 1, 2400, 10),
]

for slug, start, upper, step in books_info:
    # First find an upper bound that doesn't exist
    h = start
    while h <= upper:
        if not check_exists(slug, h):
            print(f"{slug}: #{h} doesn't exist, binary searching between {start} and {h}")
            last = find_last(slug, start, h - 1) if h > start + 1 else start
            if not check_exists(slug, start):
                print(f"  WARNING: #{start} also doesn't exist! Searching from 1")
                last = find_last(slug, 1, h - 1)
            print(f"  LAST: #{last}")
            break
        h += step
    else:
        print(f"{slug}: all checked up to {upper} exist, need higher bound")
