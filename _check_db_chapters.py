import json, sys, os, django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dawat_o_islaah.settings")
sys.path.insert(0, "/home/ubuntu/apps/dawat-o-islaah-server/")
import django
django.setup()

from hadith.models import Hadith, Book

for slug in ["musnad-ahmad", "sunan-darimi", "muwatta-malik", "mustadrak-al-hakim", "sahih-ibn-khuzaymah"]:
    try:
        book = Book.objects.get(name__iexact=slug.replace("-", " "))
    except Book.DoesNotExist:
        try:
            book = Book.objects.filter(name__icontains=slug.replace("-", " ")).first()
        except:
            book = None
    
    if not book:
        print(f"{slug}: BOOK NOT FOUND")
        continue
    
    hadiths = Hadith.objects.filter(book=book).order_by("hadith_number")
    total = hadiths.count()
    
    with_ch = hadiths.exclude(chapter_english__isnull=True).exclude(chapter_english="").count()
    unique_ch = hadiths.exclude(chapter_english__isnull=True).exclude(chapter_english="").values("chapter_english").distinct().count()
    unique_ar = hadiths.exclude(chapter_arabic__isnull=True).exclude(chapter_arabic="").values("chapter_arabic").distinct().count()
    
    sample = hadiths.filter(chapter_english__isnull=False).exclude(chapter_english="").first()
    sample_en = sample.chapter_english[:50] if sample else "NONE"
    
    print(f"{slug}: {total} total, {with_ch} with chapters, {unique_ch} unique en, {unique_ar} unique ar")
    print(f"  first chapter: {sample_en}")
