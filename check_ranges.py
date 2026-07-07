"""Check which hadith numbers exist for each book"""
import urllib.request, re

def check(slug, num):
    url = f"https://al-hadees.com/{slug}/{num}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        html = resp.read().decode("utf-8", errors="replace")
        if len(html) < 100:
            return "empty"
        has_arb = f"content-arb-{num}" in html
        return f"has_arb={has_arb}, len={len(html)}"
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}"
    except:
        return "error"

# Test various number ranges for each slug
books_slugs = ["ahmad", "darmi", "malik", "ibnkhuzaymah"]
test_numbers = [1, 2, 3, 10, 50, 100, 500, 1000, 5000]

for slug in books_slugs:
    print(f"\n{slug}:")
    for n in test_numbers:
        result = check(slug, n)
        print(f"  #{n}: {result}")
