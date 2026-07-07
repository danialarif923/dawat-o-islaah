import sys, os
sys.path.insert(0,"/home/ubuntu/apps/dawat-o-islaah-server")
os.environ.setdefault("DJANGO_SETTINGS_MODULE","dawat_o_islaah.settings")
import django; django.setup()
from quran.models import CustomFont
font = CustomFont.objects.get(name="KFGQPC Hafs")
print(f"file.name: {font.file.name}")
print(f"file.url: {font.file.url}")
from django.conf import settings
print(f"MEDIA_URL: {settings.MEDIA_URL}")
