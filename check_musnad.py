"""Check musnad-ahmed in detail - it seems to have data"""
import urllib.request, re

url = "https://al-hadees.com/musnad-ahmed/1"
req = urllib.request.Request(url, headers={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
})
resp = urllib.request.urlopen(req, timeout=15)
html = resp.read().decode("utf-8", errors="replace")

print(f"Status: {resp.status}")
print(f"URL: {resp.url}")
print(f"HTML length: {len(html)}")

# Check textareas
for suffix in range(1, 6):
    arb_id = f"content-arb-{suffix}"
    urd_id = f"content-urd-{suffix}"
    if arb_id in html or urd_id in html:
        print(f"  {arb_id}: {'YES' if arb_id in html else 'no'}")
        print(f"  {urd_id}: {'YES' if urd_id in html else 'no'}")
        if arb_id in html:
            m = re.search(rf"<textarea[^>]*[Ii][Dd]=\"{arb_id}\"[^>]*>(.*?)</textarea>", html, re.DOTALL)
            if m:
                print(f"  arb length: {len(m.group(1))}")
        if urd_id in html:
            m = re.search(rf"<textarea[^>]*[Ii][Dd]=\"{urd_id}\"[^>]*>(.*?)</textarea>", html, re.DOTALL)
            if m:
                print(f"  urd length: {len(m.group(1))}")

# Check for chapter link
has_ch_link = "hadees-subjects" in html
print(f"Chapter link present: {has_ch_link}")

# Check title without printing Arabic
title_m = re.search(r"<title>(.*?)</title>", html, re.DOTALL)
if title_m:
    title = title_m.group(1)
    print(f"Title ASCII only: {''.join(c if ord(c) < 128 else '?' for c in title)}")
    print(f"Title length: {len(title)}")

# Check for the redirect or similar
print(f"Has 'Sahih': {'Sahih' in html}")
print(f"Has 'Musnad': {'Musnad' in html}")
