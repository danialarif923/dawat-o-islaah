import urllib.request, re, json

slug = "mustadrak"
for num in [1, 2, 3, 10, 20]:
    url = f"https://al-hadees.com/{slug}/{num}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode("utf-8", errors="replace")
        print(f"#{num}: status={resp.status}, len={len(html)}, has_arb={'content-arb-1' in html}")
        if 'content-arb-1' in html:
            match = re.search(r'<textarea[^>]*[Ii][Dd]="content-arb-1"[^>]*>(.*?)</textarea>', html, re.DOTALL)
            arb_len = len(match.group(1)) if match else 0
            match2 = re.search(r'<textarea[^>]*[Ii][Dd]="content-urd-1"[^>]*>(.*?)</textarea>', html, re.DOTALL)
            urd_len = len(match2.group(1)) if match2 else 0
            print(f"   arb_len={arb_len}, urd_len={urd_len}")
    except Exception as e:
        print(f"#{num}: ERROR {e}")
