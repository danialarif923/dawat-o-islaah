"""Find correct slugs for all books on al-hadees.com"""
import urllib.request, re

def check_slug(slug, num=1):
    url = f"https://al-hadees.com/{slug}/{num}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        html = resp.read().decode("utf-8", errors="replace")
        if len(html) < 100:
            return "empty"
        arb_id = f"content-arb-{num}"
        if arb_id in html:
            m = re.search(rf"<textarea[^>]*[Ii][Dd]=\"{arb_id}\"[^>]*>(.*?)</textarea>", html, re.DOTALL)
            arb_len = len(m.group(1)) if m else 0
            return f"OK, arb_len={arb_len}"
        return f"no_arb, len={len(html)}"
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}"
    except Exception as e:
        return f"error: {e}"

# Book groups with possible slugs
book_groups = [
    ("musnad-ahmad", ["musnad-ahmad", "musnad-ahmed", "ahmad", "ahmed", "imam-ahmad", "musnad"]),
    ("sunan-darimi", ["sunan-darimi", "sunan-al-darimi", "sunan-ad-darimi", "darimi", "darmi"]),
    ("muwatta-malik", ["muwatta-malik", "muwatta-imam-malik", "muatta-malik", "malik", "imam-malik"]),
    ("sahih-ibn-khuzaymah", ["sahih-ibn-khuzaymah", "sahih-ibn-khuzayma", "ibn-khuzaymah", "ibnkhuzaymah", "ibn-khuzaimah"]),
    ("mustadrak-al-hakim", ["mustadrak", "mustadrak-al-hakim", "al-mustadrak"]),
    ("al-silsila-sahiha", ["al-silsila-sahiha", "silsila-sahih", "silsilah-sahihah"]),
]

for book_name, slugs in book_groups:
    found = False
    for slug in slugs:
        result = check_slug(slug)
        if "OK" in result:
            print(f"OK: {book_name:25s} -> /{slug:30s} {result}")
            found = True
            break
        else:
            print(f"   {slug:30s} {result}")
    if not found:
        print(f"--: {book_name:25s} -> No valid slug found")
    print()
