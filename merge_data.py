"""
Merge hadith-json (Arabic+English) with al-hadees.com scraped data (Urdu).
Outputs combined JSON ready for import on the server.
"""
import json
import os

OUTPUT_DIR = r"C:\Users\hp\Desktop\dawat-o-islaah\dawat-o-islaah\merged_data"
HADITH_JSON_DIR = r"C:\Users\hp\Desktop\dawat-o-islaah\dawat-o-islaah\hadith_json_data"
SCRAPED_DIR = r"C:\Users\hp\Desktop\dawat-o-islaah\dawat-o-islaah\scraped_data"

BOOKS = {
    "ahmad": {
        "name": "musnad-ahmad",
        "order": 8,
        "hj_file": "ahmed.json",
        "scrape_key": "ahmad",
        "hj_book_key": "ahmed",
    },
    "darmi": {
        "name": "sunan-darimi",
        "order": 9,
        "hj_file": "darimi.json",
        "scrape_key": "darmi",
        "hj_book_key": "darimi",
    },
    "malik": {
        "name": "muwatta-malik",
        "order": 10,
        "hj_file": "malik.json",
        "scrape_key": "malik",
        "hj_book_key": "malik",
    },
    "mustadrak": {
        "name": "mustadrak-al-hakim",
        "order": 11,
        "hj_file": None,
        "scrape_key": "mustadrak",
    },
    "ibnkhuzaymah": {
        "name": "sahih-ibn-khuzaymah",
        "order": 12,
        "hj_file": None,
        "scrape_key": "ibnkhuzaymah",
    },
}


def merge_book(key, info):
    hadiths = {}
    
    # Load hadith-json data (Arabic + English + chapter info)
    hj_path = os.path.join(HADITH_JSON_DIR, info["hj_file"]) if info["hj_file"] else None
    hj_chapters = []
    if hj_path and os.path.exists(hj_path):
        with open(hj_path, encoding="utf-8") as f:
            hj_data = json.load(f)
        hj_chapters = hj_data.get("chapters", [])
        
        chapter_lookup = {}
        for ch in hj_chapters:
            chapter_lookup[ch["id"]] = ch
        
        for h in hj_data.get("hadiths", []):
            hid = h.get("idInBook")
            if not hid:
                continue
            eng_raw = h.get("english", {}) or {}
            eng_text = eng_raw.get("text", "") if isinstance(eng_raw, dict) else ""
            
            ch = chapter_lookup.get(h.get("chapterId"), {})
            
            hadiths[hid] = {
                "hadith_number": hid,
                "arabic_text": h.get("arabic", "") or "",
                "english_text": eng_text,
                "urdu_text": "",
                "chapter_english": ch.get("english", "") or "",
                "chapter_arabic": ch.get("arabic", "") or "",
            }
    else:
        print(f"  No hadith-json for {key}")
    
    # Load al-hadees.com scraped data (Urdu + Arabic fallback)
    scrape_path = os.path.join(SCRAPED_DIR, f"{info['scrape_key']}.json")
    if os.path.exists(scrape_path):
        with open(scrape_path, encoding="utf-8") as f:
            al_data = json.load(f)
        
        matched = 0
        for h in al_data:
            num = h["hadith_number"]
            if num in hadiths:
                # Update existing with Urdu
                hadiths[num]["urdu_text"] = h.get("urdu_text", "") or ""
                hadiths[num]["grade"] = h.get("grade", "") or ""
                matched += 1
            else:
                # New hadith (not in hadith-json)
                hadiths[num] = {
                    "hadith_number": num,
                    "arabic_text": h.get("arabic_text", "") or "",
                    "english_text": "",
                    "urdu_text": h.get("urdu_text", "") or "",
                    "chapter_english": "",
                    "chapter_arabic": h.get("chapter_name", "") or "",
                    "grade": h.get("grade", "") or "",
                }
        print(f"  Al-hadees: {len(al_data)} hadiths, {matched} matched with hadith-json")
    else:
        print(f"  No scraped data for {key}")
    
    return list(hadiths.values())


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    overall_stats = {}
    
    for key, info in BOOKS.items():
        print(f"\nMerging {info['name']} ({key})...")
        merged = merge_book(key, info)
        
        with_arabic = sum(1 for h in merged if h["arabic_text"])
        with_english = sum(1 for h in merged if h["english_text"])
        with_urdu = sum(1 for h in merged if h["urdu_text"])
        with_chapter = sum(1 for h in merged if h["chapter_english"] or h["chapter_arabic"])
        
        out_file = os.path.join(OUTPUT_DIR, f"{key}.json")
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump({
                "book_name": info["name"],
                "book_order": info["order"],
                "hadiths": merged,
            }, f, ensure_ascii=False, indent=2)
        
        print(f"  Total: {len(merged)} hadiths")
        print(f"  Arabic: {with_arabic}, English: {with_english}, Urdu: {with_urdu}")
        print(f"  Chapters: {with_chapter}")
        print(f"  Saved to {out_file}")
        
        overall_stats[key] = {
            "total": len(merged),
            "arabic": with_arabic,
            "english": with_english,
            "urdu": with_urdu,
        }
    
    print(f"\n{'='*50}")
    print("Summary:")
    for key, stats in overall_stats.items():
        print(f"  {key}: {stats['total']} total, {stats['arabic']} arb, {stats['english']} eng, {stats['urdu']} urd")


if __name__ == "__main__":
    main()
