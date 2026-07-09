#!/bin/bash
BOOKS="musnad-ahmad sunan-darimi muwatta-malik mustadrak-al-hakim sahih-ibn-khuzaymah"
API="http://127.0.0.1:8000/api/hadith/get-chapters"

for book in $BOOKS; do
  echo "=== $book ==="
  curl -s "$API?book=$book" | python3 -c "
import json, sys
data = json.load(sys.stdin)
chapters = data.get('chapters') or data.get('data') or []
for ch in chapters:
    num = ch.get('chapterNumber')
    en = ch.get('chapterEnglish', '')
    ur = ch.get('chapterUrdu', '')
    en_esc = en.replace('\"', '\\\\\"')
    ur_esc = ur.replace('\"', '\\\\\"')
    print(f'{num}|{en_esc}|{ur_esc}')
" 2>/dev/null
done
