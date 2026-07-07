"""Debug: find textareas in raw HTML"""
import re
import urllib.request

url = "https://al-hadees.com/mustadrak/1"
req = urllib.request.Request(url, headers={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
})
resp = urllib.request.urlopen(req, timeout=15)
html_bytes = resp.read()
html = html_bytes.decode("utf-8")

# Find ALL textareas
all_tas = re.findall(r'<textarea[^>]*>.*?</textarea>', html, re.DOTALL)
print(f"Total textareas found: {len(all_tas)}")

for i, ta in enumerate(all_tas):
    # Just print the opening tag
    open_tag = re.match(r'(<textarea[^>]*>)', ta)
    print(f"TA {i}: {open_tag.group(1) if open_tag else 'no match'}")

# Find content-arb-1 specifically
pos = html.find("content-arb-1")
if pos >= 0:
    print(f"\n'content-arb-1' found at pos {pos}")
    print(f"Context: {html[pos-50:pos+150]}")
else:
    print("\n'content-arb-1' NOT found in HTML")
    # Try partial match
    pos2 = html.find("content-arb")
    if pos2 >= 0:
        print(f"'content-arb' found at pos {pos2}")
        print(f"Context: {html[pos2-50:pos2+100]}")

# Try finding with no newlines in pattern
matches = re.findall(r'content-arb-1"[^>]*>', html)
print(f"\nRegex 'content-arb-1\"[^>]*>': {len(matches)} matches")
for m in matches[:3]:
    print(f"  Match: {m}")
