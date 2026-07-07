import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dawat_o_islaah.settings')
import sys
sys.path.insert(0, '/home/ubuntu/apps/dawat-o-islaah-server')
django.setup()
from hadith.models import Book
for b in Book.objects.all().order_by('order'):
    print(b.id, repr(b.name), b.order)
