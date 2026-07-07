"""Check the main page of each book to find the correct URL pattern"""
import urllib.request, re

# Try full book name slugs
full_slugs = [
    "musnad-ahmad-bin-hanbal",
    "musnad-ahmed", 
    "sunan-darimi",
    "sunan-al-darimi",
    "muwatta-malik",
    "muatta-malik",
    "sahih-ibn-khuzaymah",
    "sunan-ibn-majah",
    "sunan-abu-dawud",
    "sunan-nasai",
    "sunan-tirmidhi",
    "sunan-dar-qutni",
]

for slug in full_slugs:
    url = f"https://al-hadees.com/{slug}/1"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        html = resp.read().decode("utf-8", errors="replace")
        has_arb = f"content-arb-1" in html
        status = f"OK, has_arb={has_arb}, len={len(html)}"
        if has_arb:
            # Get title or first meaningful content
            title_m = re.search(r"<title>(.*?)</title>", html, re.DOTALL)
            title = title_m.group(1)[:60] if title_m else "N/A"
            status += f", title={title}"
        print(f"/{slug:30s} -> {status}")
    except urllib.error.HTTPError as e:
        print(f"/{slug:30s} -> HTTP {e.code}")
    except Exception as e:
        print(f"/{slug:30s} -> {e}")
