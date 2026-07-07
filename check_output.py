import json
with open(r'C:\Users\hp\Desktop\dawat-o-islaah\dawat-o-islaah\scraped_data\mustadrak.json', encoding='utf-8') as f:
    data = json.load(f)
print(f'Hadiths in file: {len(data)}')
for item in data:
    print(f'Number: {item["hadith_number"]}')
    print(f'Chapter: {item["chapter_name"][:50] if item["chapter_name"] else "N/A"}')
    print(f'Grade: {item["grade"]}')
    arabic = item["arabic_text"]
    urdu = item["urdu_text"]
    print(f'Arabic: {arabic[:80] if arabic else "EMPTY"}...')
    print(f'Urdu: {urdu[:80] if urdu else "EMPTY"}...')
    print()
