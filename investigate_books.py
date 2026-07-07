"""Investigate book structure on al-hadees.com"""
import urllib.request, re

def get_page(slug, num=1):
    url = f"https://al-hadees.com/{slug}/{num}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    resp = urllib.request.urlopen(req, timeout=15)
    return resp.read().decode("utf-8", errors="replace")

# Check imam-malik - what does the page look like?
print("=== imam-malik/1 ===")
html = get_page("imam-malik", 1)
print(f"Length: {len(html)}")
# Find all textareas
tas = re.findall(r'<textarea[^>]*>(.*?)</textarea>', html, re.DOTALL)
print(f"Textareas: {len(tas)}")
for i, ta in enumerate(tas):
    tag_m = re.search(r'(<textarea[^>]*>)', ta)
    tag = tag_m.group(1) if tag_m else "???"
    content_len = len(ta) - len(tag) - 10
    print(f"  TA {i}: {tag} content_len={content_len}")

# Check for links to other pages
links = re.findall(r'href="(https://al-hadees\.com/imam-malik/\d+)"', html)
print(f"\nLinks to imam-malik/N: {len(set(links))}")
for l in sorted(set(links))[:10]:
    print(f"  {l}")

# Check for a "next" button or pagination
if 'next' in html.lower() or 'next' in html:
    print("\n'next' found in page")
next_matches = re.findall(r'[Nn]ext[^<]*', html)
for m in next_matches:
    print(f"  Next text: {m[:80]}")

# Check for الصفحة التالية or similar
if 'التالي' in html or 'التالية' in html:
    print("\nArabic next found")

print("\n=== sahih-ibn-khuzaymah/1 ===")
html2 = get_page("sahih-ibn-khuzaymah", 1)
print(f"Length: {len(html2)}")
tas2 = re.findall(r'<textarea[^>]*>(.*?)</textarea>', html2, re.DOTALL)
print(f"Textareas: {len(tas2)}")
links2 = re.findall(r'href="(https://al-hadees\.com/sahih-ibn-khuzaymah/\d+)"', html2)
print(f"Links to /sahih-ibn-khuzaymah/N: {len(set(links2))}")
for l in sorted(set(links2))[:10]:
    print(f"  {l}")
