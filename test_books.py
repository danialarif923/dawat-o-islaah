"""Test scraper on all 5 books (3 hadiths each)"""
import urllib.request, re

def check(slug, num):
    url = f"https://al-hadees.com/{slug}/{num}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode("utf-8", errors="replace")
    if len(html) < 1000:
        return False, "empty page"
    arb_id = f"content-arb-{num}"
    urd_id = f"content-urd-{num}"
    if arb_id not in html:
        return False, f"no {arb_id}"
    m_arb = re.search(rf'<textarea[^>]*[Ii][Dd]="{arb_id}"[^>]*>(.*?)</textarea>', html, re.DOTALL)
    m_urd = re.search(rf'<textarea[^>]*[Ii][Dd]="{urd_id}"[^>]*>(.*?)</textarea>', html, re.DOTALL)
    arb_ok = m_arb is not None and len(m_arb.group(1)) > 10
    urd_ok = m_urd is not None and len(m_urd.group(1)) > 10
    return True, f"arb={len(m_arb.group(1)) if m_arb else 0}, urd={len(m_urd.group(1)) if m_urd else 0}"

books_data = {
    "ahmad": {"slug": "musnad-ahmed", "total": 17360},
    "darmi": {"slug": "sunan-darmi", "total": 3547},
    "malik": {"slug": "imam-malik", "total": 1975},
    "mustadrak": {"slug": "mustadrak", "total": 8803},
    "ibnkhuzaymah": {"slug": "sahih-ibn-khuzaymah", "total": 2414},
}

for key, info in books_data.items():
    results = []
    for num in [1, 2, 3]:
        ok, msg = check(info["slug"], num)
        status = "OK" if ok else "FAIL"
        results.append(f"#{num}={status}({msg})")
    print(f"{key:15s} ({info['slug']:25s}): {', '.join(results)}")
