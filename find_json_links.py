import urllib.request, re

url = "https://www.hadithunlocked.com/books"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
resp = urllib.request.urlopen(req, timeout=20)
html = resp.read().decode("utf-8", errors="replace")

# Save HTML for analysis
with open("hadithunlocked_books.html", "w", encoding="utf-8") as f:
    f.write(html)

# Find all links
all_links = re.findall(r'href="([^"]*)"', html)
print("All links found:")
for link in all_links:
    if any(kw in link.lower() for kw in ["json", "ahmad", "darimi", "malik", "hakim", "khuzaymah", "download"]):
        print(f"  {link}")
