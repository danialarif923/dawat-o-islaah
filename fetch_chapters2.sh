#!/bin/bash
BOOKS="musnad-ahmad sunan-darimi muwatta-malik mustadrak-al-hakim sahih-ibn-khuzaymah"
API="http://127.0.0.1:8000/api/hadith/get-chapters/"

for book in $BOOKS; do
  echo "=== $book ==="
  curl -s -L "$API?book=$book" | python3 -c "
import json, sys
data = json.load(sys.stdin)
chapters = data.get('chapters') or data.get('data') or []
out = {}
for ch in chapters:
    num = ch.get('chapterNumber')
    en = ch.get('chapterEnglish', '')
    ar = ch.get('chapterArabic', '')
    ur = ch.get('chapterUrdu', '')
    out[str(num)] = {
        'en': en,
        'ur': ur if ur else ar,
        'ar': ar
    }
print(json.dumps(out, ensure_ascii=False))
"
  echo ""
done
