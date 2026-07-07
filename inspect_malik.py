"""Inspect imam-malik page structure thoroughly"""
import urllib.request, re

def get_page(slug, page_num):
    url = f"https://al-hadees.com/{slug}/{page_num}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode("utf-8", errors="replace")
    
    print(f"\n{'='*60}")
    print(f"PAGE: {slug}/{page_num}")
    print(f"Length: {len(html)}")
    
    # Find all hadith-related IDs
    arb_ids = re.findall(r'content-arb-(\d+)', html)
    urd_ids = re.findall(r'content-urd-(\d+)', html)
    eng_ids = re.findall(r'content-eng-(\d+)', html)
    all_ids = re.findall(r'content-all-(\d+)', html)
    
    print(f"content-arb: {sorted(set(arb_ids), key=int) if arb_ids else 'NONE'}")
    print(f"content-urd: {sorted(set(urd_ids), key=int) if urd_ids else 'NONE'}")
    print(f"content-eng: {sorted(set(eng_ids), key=int) if eng_ids else 'NONE'}")
    print(f"content-all: {sorted(set(all_ids), key=int) if all_ids else 'NONE'}")
    
    # Get actual content lengths
    for hid in sorted(set(arb_ids + urd_ids + eng_ids), key=int):
        info = f"  #{hid}: "
        if f"content-arb-{hid}" in html:
            m = re.search(rf'<textarea[^>]*[Ii][Dd]="content-arb-{hid}"[^>]*>(.*?)</textarea>', html, re.DOTALL)
            info += f"arb={len(m.group(1)) if m else 0}, "
        if f"content-urd-{hid}" in html:
            m = re.search(rf'<textarea[^>]*[Ii][Dd]="content-urd-{hid}"[^>]*>(.*?)</textarea>', html, re.DOTALL)
            info += f"urd={len(m.group(1)) if m else 0}, "
        if f"content-eng-{hid}" in html:
            m = re.search(rf'<textarea[^>]*[Ii][Dd]="content-eng-{hid}"[^>]*>(.*?)</textarea>', html, re.DOTALL)
            info += f"eng={len(m.group(1)) if m else 0}"
        print(info)
    
    # Check nav links
    nav_links = re.findall(r'href="(https://al-hadees\.com/[^"]+)"[^>]*>\s*(?:Next|Previous|next|previous|التالي)\s*<', html)
    print(f"Nav links: {nav_links}")
    
    # Check for multiple hadiths per page
    all_tas = re.findall(r'<textarea[^>]*>(.*?)</textarea>', html, re.DOTALL)
    print(f"Total textareas: {len(all_tas)}")

get_page("imam-malik", 1)
get_page("imam-malik", 20)
get_page("sahih-ibn-khuzaymah", 1)
get_page("sahih-ibn-khuzaymah", 10)
