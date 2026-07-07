"""Quick test to debug the scraper"""
import re
import urllib.request

url = "https://al-hadees.com/mustadrak/1"
req = urllib.request.Request(url, headers={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
})
resp = urllib.request.urlopen(req, timeout=15)
html = resp.read().decode("utf-8")

print(f"HTML length: {len(html)}")

# Check textareas
arb = re.search(r'<textarea[^>]*id="content-arb-1"[^>]*>(.*?)</textarea>', html, re.DOTALL)
urd = re.search(r'<textarea[^>]*id="content-urd-1"[^>]*>(.*?)</textarea>', html, re.DOTALL)

print(f"Arabic found: {arb is not None}, Length: {len(arb.group(1)) if arb else 0}")
print(f"Urdu found: {urd is not None}, Length: {len(urd.group(1)) if urd else 0}")

if arb:
    text = arb.group(1)
    text = text.replace("&#13;&#10;", "\n").replace("&#10;", "\n").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&#039;", "'").replace("&quot;", '"')
    print(f"Arabic preview: {text[:100]}")

if urd:
    text = urd.group(1)
    text = text.replace("&#13;&#10;", "\n").replace("&#10;", "\n")
    print(f"Urdu preview: {text[:100]}")

# Check chapter
matches = re.findall(r'<h[1-3][^>]*>(.*?)</h[1-3]>', html, re.DOTALL)
print(f"\nH1-H3 headers: {len(matches)}")
for i, m in enumerate(matches):
    text = re.sub(r'<[^>]+>', '', m).strip()
    text = re.sub(r'\s+', ' ', text)
    print(f"  H{i+1}: '{text}'")
