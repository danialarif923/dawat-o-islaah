"""Generate a comprehensive status report"""
import json, os

print("=" * 70)
print("DATA IMPORT STATUS REPORT")
print("=" * 70)

# 1. Merged data files
print("\n--- MERGED DATA (ready for import) ---")
merged_dir = r"C:\Users\hp\Desktop\dawat-o-islaah\dawat-o-islaah\merged_data"
if os.path.exists(merged_dir):
    for f in sorted(os.listdir(merged_dir)):
        if f.endswith(".json"):
            path = os.path.join(merged_dir, f)
            size = os.path.getsize(path)
            with open(path, encoding="utf-8") as fp:
                data = json.load(fp)
            hadiths = data.get("hadiths", [])
            n = len(hadiths)
            arb = sum(1 for h in hadiths if h.get("arabic_text"))
            eng = sum(1 for h in hadiths if h.get("english_text"))
            urd = sum(1 for h in hadiths if h.get("urdu_text"))
            ch = sum(1 for h in hadiths if h.get("chapter_english") or h.get("chapter_arabic"))
            print(f"  {f:25s}: {n:4d} hadiths | arb={arb:4d} eng={eng:4d} urd={urd:4d} ch={ch:4d} | {size//1024:4d}KB")

# 2. Sources used
print("\n--- DATA SOURCES ---")
print("  Musnad Ahmad:    hadith-json (Arabic+English) + al-hadees.com (Urdu 1-900)")
print("  Sunan Darimi:    hadith-json (Arabic only, NO English)")
print("  Muwatta Malik:   hadith-json (Arabic+English) + al-hadees.com (Urdu, needs scrape)")
print("  Mustadrak:       al-hadees.com (Arabic+Urdu, partial 963/8803)")
print("  Ibn Khuzaymah:   al-hadees.com (only 10 hadiths on site)")

# 3. Missing data
print("\n--- MISSING DATA ---")
print("  Darimi: NO English text (hadith-json has empty english field for all 3406)")
print("  Mustadrak: NO English text, incomplete (963/8803 from al-hadees.com)")
print("  Ibn Khuzaymah: No data available (only 10 hadiths on al-hadees.com)")
print("  Malik: Need to scrape Urdu from al-hadees.com (~16 hadiths)")
print("  Ahmad: Need more Urdu (only 900/1374 have Urdu)")

# 4. Recommendations
print("\n--- RECOMMENDED ACTIONS ---")
print("  1. Run: python scrape_local.py darmi --force  (35 min for 3400 Urdu hadiths)")
print("  2. Run: python scrape_local.py malik --force  (fast, ~16 pages)")
print("  3. Run: python scrape_local.py mustadrak --force (continue from 963)")
print("  4. Run: python merge_data.py (re-merge after scrapes)")
print("  5. Upload merged_data/*.json + import_merged.py to server")
print("  6. On server: python manage.py import_merged --all --dir=merged_data")
print("\n  Alternative for English text:")
print("    - Darimi English: Not available in any free source found")
print("    - Mustadrak English: Not available in any free source found")

# 5. Files to deploy
print("\n--- FILES TO DEPLOY ---")
print("  cp hadith/management/commands/import_merged.py <server>/hadith/management/commands/")
print("  cp merged_data/*.json <server>/merged_data/")
print("  scp -i dawat-o-islaah.pem merged_data/*.json ubuntu@13.127.232.43:/home/ubuntu/apps/dawat-o-islaah-server/merged_data/")
print("  scp -i dawat-o-islaah.pem hadith/management/commands/import_merged.py ubuntu@13.127.232.43:/home/ubuntu/apps/dawat-o-islaah-server/hadith/management/commands/")
print("\n  Then on server:")
print("  cd /home/ubuntu/apps/dawat-o-islaah-server")
print("  source venv/bin/activate")
print("  python manage.py import_merged --all --dir=merged_data")
print("=" * 70)
