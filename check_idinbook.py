import json

for f in ['ahmed.json','darimi.json','malik.json']:
    path = f'hadith_json_data/{f}'
    with open(path, encoding='utf-8') as fp:
        data = json.load(fp)
    
    hadiths = data['hadiths']
    
    h1 = hadiths[0]
    h_last = hadiths[-1]
    
    id1 = h1.get('idInBook', h1.get('id'))
    id_last = h_last.get('idInBook', h_last.get('id'))
    
    print(f'{f}:')
    print(f'  Total: {len(hadiths)}')
    print(f'  First: idInBook={h1.get("idInBook")}, id={h1.get("id")}')
    print(f'  Last:  idInBook={h_last.get("idInBook")}, id={h_last.get("id")}')
    
    # Check for missing english
    empty_eng = sum(1 for h in hadiths if not h.get('english', {}).get('text', ''))
    print(f'  Hadiths with empty English: {empty_eng}/{len(hadiths)}')
    
    # Check for missing arabic  
    empty_arb = sum(1 for h in hadiths if not h.get('arabic', ''))
    print(f'  Hadiths with empty Arabic: {empty_arb}/{len(hadiths)}')
    print()
