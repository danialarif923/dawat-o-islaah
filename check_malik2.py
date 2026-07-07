"""Check imam-malik/2 structure"""
import urllib.request, re

for num in [1, 2, 5, 10, 20]:
    url = f"https://al-hadees.com/imam-malik/{num}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        html = resp.read().decode("utf-8", errors="replace")
        if len(html) < 100:
            print(f"imam-malik/{num}: empty")
            continue
        
        # Find hadith numbers in textarea IDs
        hadith_nums = set()
        for m in re.finditer(r'content-arb-(\d+)', html):
            hadith_nums.add(int(m.group(1)))
        for m in re.finditer(r'content-urd-(\d+)', html):
            hadith_nums.add(int(m.group(1)))
        
        # Count textareas
        arb_count = len(re.findall(r'content-arb-\d+', html))
        urd_count = len(re.findall(r'content-urd-\d+', html))
        
        print(f"imam-malik/{num}: len={len(html)}, hadith_ids={sorted(hadith_nums)}, arb={arb_count}, urd={urd_count}")
        
    except Exception as e:
        print(f"imam-malik/{num}: error {e}")
