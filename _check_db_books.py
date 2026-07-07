import os, sys, django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dawat_o_islaah.settings")
sys.path.insert(0, "/home/ubuntu/apps/dawat-o-islaah-server/")
django.setup()

from hadith.models import Book, Hadith

for b in Book.objects.all().order_by("order"):
    total = Hadith.objects.filter(book=b).count()
    with_ch = Hadith.objects.filter(book=b).exclude(chapter_english__isnull=True).exclude(chapter_english="").count()
    unique_ch = Hadith.objects.filter(book=b).exclude(chapter_english__isnull=True).exclude(chapter_english="").values("chapter_english").distinct().count()
    print(f"{b.name:40s} order={b.order:2d} total={total:5d} chapters={with_ch:5d} unique_ch={unique_ch:3d}")
