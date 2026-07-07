import json
import re
import sys
import os

sys.path.insert(0, "/home/ubuntu/apps/dawat-o-islaah-server")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dawat_o_islaah.settings")

import django
django.setup()

from quran.models import Ayat

with open("/tmp/qpc-hafs-word-by-word.json", "r", encoding="utf-8") as f:
    data = json.load(f)

ayah_words = {}
for key, entry in data.items():
    surah = int(entry["surah"])
    ayah = int(entry["ayah"])
    surah_ayah = (surah, ayah)
    if surah_ayah not in ayah_words:
        ayah_words[surah_ayah] = []
    ayah_words[surah_ayah].append(entry)

ayah_keys = sorted(ayah_words.keys())
print(f"Loaded {len(ayah_keys)} ayahs from QPC Hafs JSON")

updated = 0
for surah_ayah in ayah_keys:
    surah, ayah = surah_ayah
    words = sorted(ayah_words[surah_ayah], key=lambda w: int(w["word"]))
    
    last_word = words[-1]["text"]
    is_ayah_marker = bool(re.match(r'^[\d\u0660-\u0669]+$', last_word))
    
    if is_ayah_marker:
        text_words = [w["text"] for w in words[:-1]]
    else:
        text_words = [w["text"] for w in words]
    
    full_text = " ".join(text_words)
    
    qpc_0652 = full_text.count('\u0652')
    qpc_06e1 = full_text.count('\u06E1')
    
    try:
        ayat = Ayat.objects.get(surah=surah, ayat_number=ayah)
        ayat.text = f"<p>{full_text}</p>"
        ayat.save()
        updated += 1
        if surah <= 3 or (surah == 19 and ayah <= 3):
            print(f"  {surah}:{ayah} → OK (sukun: U+0652={qpc_0652}, U+06E1={qpc_06e1}, words={len(text_words)}+{'marker' if is_ayah_marker else ''})")
    except Ayat.DoesNotExist:
        print(f"  {surah}:{ayah} → NOT FOUND IN DB (SKIPPING)")

print(f"\nUpdated {updated} ayahs")
