import json

lines = []
for f in ['ahmed.json','darimi.json','malik.json']:
    path = f'hadith_json_data/{f}'
    with open(path, encoding='utf-8') as fp:
        data = json.load(fp)
    
    hadiths = data['hadiths']
    chapters = data['chapters']
    metadata = data['metadata']
    
    lines.append(f'{f}:')
    lines.append(f'  Metadata book_id={metadata.get("bookId")}, arabic_name={metadata.get("arabic_name","").encode("ascii","replace").decode()}')
    lines.append(f'  Hadiths type: {type(hadiths).__name__}')
    
    if isinstance(hadiths, dict):
        keys = list(hadiths.keys())
        lines.append(f'  Hadith count: {len(keys)}')
        lines.append(f'  First key: {keys[0]}')
        h = hadiths[keys[0]]
        lines.append(f'  Keys: {list(h.keys())}')
        eng = h.get('english', {})
        if isinstance(eng, dict):
            lines.append(f'  English has: {list(eng.keys())}')
        lines.append(f'  Arabic length: {len(h.get("arabic", ""))}')
    elif isinstance(hadiths, list):
        lines.append(f'  Hadith count: {len(hadiths)}')
    
    lines.append(f'  Chapters count: {len(chapters)}')
    if chapters:
        ch = chapters[0]
        ch_clean = {k: v for k, v in ch.items() if k != 'hadiths'}
        lines.append(f'  First chapter keys: {list(ch_clean.keys())}')
        lines.append(f'  First chapter id={ch.get("id")}')
        if 'hadiths' in ch:
            lines.append(f'  First chapter hadiths count: {len(ch["hadiths"])}')
    lines.append('')

result = '\n'.join(lines)
with open('hadith_json_structure.txt', 'w', encoding='utf-8') as f:
    f.write(result)
print(result)
