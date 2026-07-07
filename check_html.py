"""Check HTML structure for ahmad/1 vs mustadrak/1"""
import urllib.request, re

for slug in ["ahmad", "mustadrak"]:
    url = f"https://al-hadees.com/{slug}/1"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode("utf-8", errors="replace")
    
    print(f"\n{'='*60}")
    print(f"SLUG: {slug}")
    print(f"Status: {resp.status}, URL: {resp.url}")
    print(f"HTML length: {len(html)}")
    
    # Check for redirect
    if resp.url != url:
        print(f"REDIRECTED to: {resp.url}")
    
    # Check how many textareas
    tas = re.findall(r"<textarea[^>]*>(.*?)</textarea>", html, re.DOTALL)
    print(f"Textareas: {len(tas)}")
    for i, ta in enumerate(tas[:3]):
        tag_match = re.match(r"(<textarea[^>]*>)", ta)
        tag = tag_match.group(1) if tag_match else "???"
        # Only show tag, not content (it has Arabic)
        print(f"  TA {i}: {tag}")
    
    # Check for content-arb
    for suffix in ["1", "2", "3", "4", "5"]:
        if f"content-arb-{suffix}" in html:
            print(f"  content-arb-{suffix} FOUND")
    
    # Check for 'Sahih' in the page
    print(f"  'Sahih' in page: {'Sahih' in html}")
    
    # Check first 500 chars for context
    print(f"  First 500 chars: {html[:500]}")
    
    # Check last 200 chars
    print(f"  Last 200 chars: {html[-200:]}")
