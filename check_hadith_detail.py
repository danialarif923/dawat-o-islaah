import json

for f in ['ahmed.json','darimi.json','malik.json']:
    path = f'hadith_json_data/{f}'
    with open(path, encoding='utf-8') as fp:
        data = json.load(fp)
    
    hadiths = data['hadiths']
    chapters = data['chapters']
    
    print(f'{f}: {len(hadiths)} hadiths, {len(chapters)} chapters')
    
    # First hadith
    h = hadiths[0]
    print(f'  First hadith keys: {list(h.keys())}')
    print(f'  id={h.get("id")}, chapterId={h.get("chapterId")}')
    print(f'  Arabic: {(h.get("arabic","")[:80]).encode("ascii","replace").decode()}')
    eng = h.get('english', {})
    if isinstance(eng, dict):
        print(f'  English narrator: {(eng.get("narrator","")[:60]).encode("ascii","replace").decode()}')
        print(f'  English text: {(eng.get("text","")[:60]).encode("ascii","replace").decode()}')
    
    # Last hadith
    h_last = hadiths[-1]
    print(f'  Last hadith id={h_last.get("id")}')
    
    # Chapters structure
    ch = chapters[0]
    print(f'  First chapter keys: {list(ch.keys())}')
    if 'hadiths' in ch:
        print(f'  First chapter hadiths count: {len(ch["hadiths"])}')
    print()
