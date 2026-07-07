"""Check pagination for multi-hadith books"""
import urllib.request, re

def page_info(slug, page_num):
    url = f"https://al-hadees.com/{slug}/{page_num}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        html = resp.read().decode("utf-8", errors="replace")
        if len(html) < 100:
            return {"empty": True}
        
        arb_ids = sorted(set(re.findall(r'content-arb-(\d+)', html)), key=int)
        urd_ids = sorted(set(re.findall(r'content-urd-(\d+)', html)), key=int)
        
        # Get actual content (not just presence)
        hadiths = []
        for hid in arb_ids:
            m = re.search(rf'<textarea[^>]*[Ii][Dd]="content-arb-{hid}"[^>]*>(.*?)</textarea>', html, re.DOTALL)
            arb_len = len(m.group(1)) if m else 0
            m2 = re.search(rf'<textarea[^>]*[Ii][Dd]="content-urd-{hid}"[^>]*>(.*?)</textarea>', html, re.DOTALL)
            urd_len = len(m2.group(1)) if m2 else 0
            hadiths.append({"hid": hid, "arb": arb_len, "urd": urd_len})
        
        # Find next page link
        next_match = re.search(r'class="[^"]*next[^"]*"[^>]*href="(https://al-hadees\.com/([^"]+))"', html, re.IGNORECASE)
        next_page = next_match.group(2) if next_match else None
        if not next_page:
            # Try just text 'next' with href
            next_match = re.search(r'href="(https://al-hadees\.com/([^"]+))"[^>]*>\s*[Nn]ext', html)
            next_page = next_match.group(2) if next_match else None
        
        return {
            "empty": False,
            "url_num": page_num,
            "hadith_ids": arb_ids,
            "hadiths": hadiths,
            "next": next_page,
            "len": len(html),
        }
    except Exception as e:
        return {"error": str(e)}

# Check sahih-ibn-khuzaymah pages
print("=== sahih-ibn-khuzaymah ===")
for pn in [1, 2, 3, 4, 5]:
    info = page_info("sahih-ibn-khuzaymah", pn)
    if info.get("empty"):
        print(f"  page {pn}: EMPTY")
        break
    if "error" in info:
        print(f"  page {pn}: {info['error']}")
        continue
    hadith_info = ", ".join(f"#{h['hid']}(a={h['arb']},u={h['urd']})" for h in info["hadiths"])
    print(f"  page {pn}: ids={info['hadith_ids']}, next={info['next']}")
    print(f"    {hadith_info}")

print("\n=== imam-malik ===")
for pn in [1, 2, 3, 10, 13, 14, 15]:
    info = page_info("imam-malik", pn)
    if info.get("empty"):
        print(f"  page {pn}: EMPTY")
        continue
    if "error" in info:
        print(f"  page {pn}: {info['error']}")
        continue
    hadith_info = ", ".join(f"#{h['hid']}(a={h['arb']},u={h['urd']})" for h in info["hadiths"])
    print(f"  page {pn}: ids={info['hadith_ids']}, next={info['next']}")
    print(f"    {hadith_info}")
