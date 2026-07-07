import json, sys
sys.stdout.reconfigure(encoding='utf-8')

books = [
    ('musnad-ahmad.json', 'Ahmad', 27400),
    ('sunan-darimi.json', 'Darimi', 3547),
    ('muwatta-malik.json', 'Malik', 1975),
    ('mustadrak-al-hakim.json', 'Mustadrak', 7646),
    ('sahih-ibn-khuzaymah.json', 'Ibn Khuzaymah', 2414),
]

for fname, label, expected in books:
    with open('merged_data/' + fname, encoding='utf-8') as f:
        data = json.load(f)
    hs = data['hadiths']
    no_en = [h['hadith_number'] for h in hs if not h['english_text']]
    no_ur = [h['hadith_number'] for h in hs if not h['urdu_text']]
    print('%s: total=%d, missing_en=%d, missing_ur=%d' % (label, len(hs), len(no_en), len(no_ur)))
    if no_en:
        print('  Missing EN (first 10):', no_en[:10])
    if no_ur:
        print('  Missing UR (first 10):', no_ur[:10])
