import json, os, sys, re
from collections import defaultdict
sys.stdout.reconfigure(encoding="utf-8")

HADITHUNLOCKED_DIR = "hadithunlocked_data"
FAW_DIR = "fawazahmed0_urdu"
SCRAPED_DIR = "scraped_data"
OUTPUT_DIR = "merged_data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

BOOK_CONFIG = {
    "darimi.json": {
        "book_name": "sunan-darimi",
        "book_order": 9,
        "faw_urdu": None,
        "scraped_slug": "darmi",
    },
    "malik.json": {
        "book_name": "muwatta-malik",
        "book_order": 10,
        "faw_urdu": "urd-malik.json",
        "scraped_slug": "imam-malik",
    },
    "ahmad.json": {
        "book_name": "musnad-ahmad",
        "book_order": 8,
        "faw_urdu": None,
        "scraped_slug": "musnad-ahmed",
    },
    "hakim.json": {
        "book_name": "mustadrak-al-hakim",
        "book_order": 11,
        "faw_urdu": None,
        "scraped_slug": "mustadrak",
    },
    "ibnkhuzaymah.json": {
        "book_name": "sahih-ibn-khuzaymah",
        "book_order": 12,
        "faw_urdu": None,
        "scraped_slug": "sahih-ibn-khuzaymah",
    },
}


def load_faw_urdu(fname):
    if not fname:
        return None
    path = os.path.join(FAW_DIR, fname)
    if not os.path.exists(path):
        print(f"  FAW file not found: {path}")
        return None
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"  Loaded FAW Urdu: {len(data.get('hadiths', []))} entries")
    # Index by section -> list of (position, urdu_text)
    faw_by_sec = defaultdict(list)
    for h in data.get("hadiths", []):
        sec = h.get("reference", {}).get("book", 0)
        if sec == 0:
            continue
        pos = h.get("reference", {}).get("hadith", 0)
        faw_by_sec[sec].append((pos, h.get("text", "")))
    for sec in faw_by_sec:
        faw_by_sec[sec].sort(key=lambda x: x[0])
    return faw_by_sec


def load_scraped_urdu(slug):
    candidates = [f"{slug}.json", f"{slug.replace('-', '')}.json"]
    for c in candidates:
        path = os.path.join(SCRAPED_DIR, c)
        if os.path.exists(path):
            break
    else:
        return {}
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    result = {}
    for h in data:
        num = h.get("hadith_number") or h.get("Number")
        if num:
            result[int(num)] = h.get("urdu_text") or h.get("UrduText") or ""
    print(f"  Loaded scraped Urdu: {len(result)} entries")
    return result


def get_title(d, key):
    """Get a title string from a dict title or plain string."""
    v = d.get("title", "")
    if isinstance(v, dict):
        return v.get(key, "") or ""
    return v or ""


def iter_chapter_items(ch):
    """Yield (chapter_number, section_ar, section_en, item) for every item in a chapter.
    
    Handles varying HL JSON structures:
      - items directly in chapter (ahmad)
      - sections with items (malik, darimi, etc.)
    Falls back to chapter title when section title is missing.
    """
    ch_num = ch.get("number") or 0
    ch_ar = get_title(ch, "ar")
    ch_en = get_title(ch, "en")

    # Case 1: items directly in chapter (ahmad)
    if "items" in ch and not ch.get("sections"):
        for item in ch["items"]:
            yield (ch_num, ch_ar, ch_en, item)
        return

    # Case 2: sections with items
    for sec in ch.get("sections", []):
        sec_ar = get_title(sec, "ar") or ch_ar
        sec_en = get_title(sec, "en") or ch_en
        for item in sec.get("items", []):
            yield (ch_num, sec_ar, sec_en, item)


for hl_file, config in BOOK_CONFIG.items():
    hl_path = os.path.join(HADITHUNLOCKED_DIR, hl_file)
    if not os.path.exists(hl_path):
        print(f"SKIP {hl_file}: not found")
        continue

    book_name = config["book_name"]
    book_order = config["book_order"]
    print(f"\n=== {hl_file} -> {book_name} (order={book_order}) ===")

    with open(hl_path, "r", encoding="utf-8") as f:
        hl_data = json.load(f)

    faw_urdu = load_faw_urdu(config["faw_urdu"])
    scraped_urdu = load_scraped_urdu(config["scraped_slug"])

    hadiths_out = []
    hadith_number = 1

    # Track FAW position per chapter number
    faw_ch_idx = defaultdict(int)

    for ch in hl_data.get("chapters", []):
        ch_num = ch.get("number") or 0

        for ch_num_item, sec_ar, sec_en, item in iter_chapter_items(ch):
            text = item.get("text", {})
            ar = text.get("ar", "").strip() if isinstance(text, dict) else ""
            en = text.get("en", "").strip() if isinstance(text, dict) else ""
            if not ar and not en:
                hadith_number += 1
                continue

            ur = scraped_urdu.get(hadith_number, "")

            # Try FAW Urdu by chapter-aware position
            if not ur and faw_urdu and ch_num_item in faw_urdu:
                idx = faw_ch_idx[ch_num_item]
                faw_items = faw_urdu[ch_num_item]
                if idx < len(faw_items):
                    ur = faw_items[idx][1]
                    faw_ch_idx[ch_num_item] += 1

            ref = item.get("ref", "")
            if not ref:
                chap = ch.get("number", "")
                sec = item.get("number", "")
                ref = f"{book_name}:{chap}.{sec}"

            hadiths_out.append({
                "hadith_number": hadith_number,
                "chapter_arabic": sec_ar,
                "chapter_english": sec_en,
                "arabic_text": ar,
                "english_text": en,
                "urdu_text": ur,
                "reference": ref,
            })
            hadith_number += 1

    out = {
        "book_name": book_name,
        "book_order": book_order,
        "hadiths": hadiths_out,
    }

    out_path = os.path.join(OUTPUT_DIR, f"{book_name}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    ac = sum(1 for h in hadiths_out if h["arabic_text"])
    ec = sum(1 for h in hadiths_out if h["english_text"])
    uc = sum(1 for h in hadiths_out if h["urdu_text"])
    print(f"  Total: {len(hadiths_out)}, ar={ac}, en={ec}, ur={uc}")
    print(f"  Saved to {out_path}")

print("\nDone!")
