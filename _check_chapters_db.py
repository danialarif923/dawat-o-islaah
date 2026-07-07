from hadith.models import Hadith, Book
from django.db.models import Count

for name in ["musnad-ahmad", "sunan-darimi", "muwatta-malik", "mustadrak-al-hakim", "sahih-ibn-khuzaymah"]:
    b = Book.objects.get(name=name)
    with_ch = b.hadiths.exclude(chapter_english="").count()
    total = b.hadiths.count()
    ch_count = b.hadiths.values("chapter_english").exclude(chapter_english="").distinct().count()
    print(f"{name}: {total} total, {with_ch} with chapters, {ch_count} unique chapters")
    if with_ch > 0:
        h = b.hadiths.exclude(chapter_english="").first()
        print(f"  Sample: #{h.hadith_number} ch_en={h.chapter_english[:60]}")
