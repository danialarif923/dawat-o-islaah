"""Find correct slugs for all books on al-hadees.com"""
import urllib.request, re

# Try various slug patterns
candidates = {
    "ahmad": ["ahmad", "musnad-ahmad", "musnad-ahmed", "musnad", "musnad-ahmad-bin-hanbal"],
    "darmi": ["darmi", "sunan-darimi", "sunan-al-darimi", "darimi", "sunan-ad-darimi"],
    "malik": ["malik", "muwatta-malik", "muwatta-imam-malik", "muatta-malik"],
    "ibnkhuzaymah": ["ibnkhuzaymah", "sahih-ibn-khuzaymah", "ibn-khuzaymah", "sahih-ibn-khuzayma"],
    "mustadrak": ["mustadrak", "mustadrak-al-hakim", "al-mustadrak"],
    "silsila-sahih": ["silsila-sahih", "al-silsila-sahiha", "silsilah-sahihah"],
}

for book, slugs in candidates.items():
    found = False
    for slug in slugs:
        url = f"https://al-hadees.com/{slug}/1"
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        })
        try:
            resp = urllib.request.urlopen(req, timeout=10)
            html = resp.read().decode("utf-8", errors="replace")
            has_arb = f"content-arb-1" in html
            title_match = re.search(r"<title>(.*?)</title>", html, re.DOTALL)
            title = title_match.group(1)[:40] if title_match else "N/A"
            print(f"{book:15s} /{slug:25s} -> status={resp.status}, has_arb={has_arb}, title={title}")
            if has_arb:
                found = True
        except urllib.error.HTTPError as e:
            if e.code == 404:
                print(f"{book:15s} /{slug:25s} -> 404")
            else:
                print(f"{book:15s} /{slug:25s} -> ERROR {e.code}")
        except Exception as e:
            print(f"{book:15s} /{slug:25s} -> {e}")
    print()
