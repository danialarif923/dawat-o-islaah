import json, os

with open(r'C:\Users\hp\Desktop\dawat-o-islaah\dawat-o-islaah\scraped_data\mustadrak.json', encoding='utf-8') as f:
    data = json.load(f)

lines = [f"Total: {len(data)} hadiths"]
for h in data:
    num = h['hadith_number']
    chapter = h['chapter_name']
    arb_len = len(h['arabic_text'])
    urd_len = len(h['urdu_text'])
    grade = h['grade']
    lines.append(f"#{num}: chapter='{chapter}' (len={len(chapter)}), arabic={arb_len}, urdu={urd_len}, grade={grade}")

with open(r'C:\Users\hp\Desktop\dawat-o-islaah\dawat-o-islaah\scraped_data\verify.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print("Verification written to scraped_data/verify.txt")
