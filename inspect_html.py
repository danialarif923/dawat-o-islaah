import urllib.request, re, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

for num in [2, 3, 10]:
    url = f"https://al-hadees.com/mustadrak/{num}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode("utf-8", errors="replace")
    
    with open(f"C:\\Users\\hp\\Desktop\\dawat-o-islaah\\dawat-o-islaah\\page_{num}.html", "w", encoding="utf-8") as f:
        f.write(html)
    
    title_match = re.search(r'<title>(.*?)</title>', html, re.DOTALL)
    title = title_match.group(1) if title_match else "NONE"
    print(f"#{num}: len={len(html)}, title has non-ascii: {any(ord(c) > 127 for c in title)}")
    
    tas = re.findall(r'<textarea[^>]*>.*?</textarea>', html, re.DOTALL)
    print(f"  Textareas: {len(tas)}")
    for i, ta in enumerate(tas):
        open_tag = re.match(r'(<textarea[^>]*>)', ta)
        tag = open_tag.group(1) if open_tag else "???"
        content_len = len(ta) - len(tag) - 10
        print(f"    TA {i}: {tag}, content_len={content_len}")
    
    if 'Just a moment' in html or 'cf-browser-verification' in html:
        print("  WARNING: Cloudflare challenge page!")
    print()
