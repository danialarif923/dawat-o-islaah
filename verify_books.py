"""Quick test: check all 5 books load correctly"""
import urllib.request, re

def check(slug, num=1):
    url = f"https://al-hadees.com/{slug}/{num}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode("utf-8", errors="replace")
    
    arb_id = f"content-arb-{num}"
    urd_id = f"content-urd-{num}"
    eng_id = f"content-eng-{num}"
    
    has_arb = arb_id in html
    has_urd = urd_id in html
    has_eng = eng_id in html
    
    arb_len = 0
    urd_len = 0
    eng_len = 0
    if has_arb:
        m = re.search(rf"<textarea[^>]*[Ii][Dd]=\"{arb_id}\"[^>]*>(.*?)</textarea>", html, re.DOTALL)
        if m: arb_len = len(m.group(1))
    if has_urd:
        m = re.search(rf"<textarea[^>]*[Ii][Dd]=\"{urd_id}\"[^>]*>(.*?)</textarea>", html, re.DOTALL)
        if m: urd_len = len(m.group(1))
    if has_eng:
        m = re.search(rf"<textarea[^>]*[Ii][Dd]=\"{eng_id}\"[^>]*>(.*?)</textarea>", html, re.DOTALL)
        if m: eng_len = len(m.group(1))
    
    has_chapter_link = f"hadees-subjects/{slug}" in html
    
    return {
        "slug": slug,
        "status": resp.status,
        "html_len": len(html),
        "has_arb": has_arb, "arb_len": arb_len,
        "has_urd": has_urd, "urd_len": urd_len,
        "has_eng": has_eng, "eng_len": eng_len,
        "has_chapter": has_chapter_link,
    }

books = ["ahmad", "darmi", "malik", "mustadrak", "ibnkhuzaymah"]
results = []
for b in books:
    r = check(b, 1)
    results.append(r)
    ok = "OK" if r["has_arb"] and r["has_urd"] else "WARN"
    print(f"{b:15s}: status={r['status']}, arb={r['arb_len']:>4}, urd={r['urd_len']:>4}, eng={r['eng_len']:>3}, ch={r['has_chapter']} -> {ok}")

# Check if any failed
if any(not r["has_arb"] or not r["has_urd"] for r in results):
    print("\nSome books missing data! Check individual results.")
else:
    print("\nAll books OK - ready for full scrape!")
