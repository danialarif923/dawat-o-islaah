"""Find the correct slug for Sunan Darimi"""
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

# Many more possibilities for Darimi
darimi_slugs = [
    "darimi", "darmi", "sunan-darimi", "sunan-al-darimi", "sunan-ad-darimi",
    "imam-darimi", "ad-darimi", "al-darimi", "darimi-sunan", "sunan-darmi",
    "sunan-al-darmi", "darmi-sunan",
]

for slug in darimi_slugs:
    result = check_slug(slug)
    print(f"/{slug:25s} -> {result}")

# Also try the Arabic title - maybe it's on a different subdomain
print("\nTrying site search...")
site_url = "https://al-hadees.com/hadees-books"
try:
    req = urllib.request.Request(site_url, headers={"User-Agent": "Mozilla/5.0"})
    resp = urllib.request.urlopen(req, timeout=10)
    html = resp.read().decode("utf-8", errors="replace")
    # Find all links that contain 'darimi' or 'darmi'
    links = re.findall(r'href="([^"]*darimi[^"]*)"', html, re.IGNORECASE)
    links2 = re.findall(r'href="([^"]*darmi[^"]*)"', html, re.IGNORECASE)
    all_links = links + links2
    if all_links:
        for link in all_links:
            print(f"  Found link: {link}")
    else:
        # Print all book links
        book_links = re.findall(r'href="(https://al-hadees\.com/[^"/]+/?)"', html)
        for bl in sorted(set(book_links)):
            # Get only the path
            path = bl.replace("https://al-hadees.com/", "")
            print(f"  Book on site: /{path}")
except Exception as e:
    print(f"  Error: {e}")
