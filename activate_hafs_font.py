import sys
import os

sys.path.insert(0, "/home/ubuntu/apps/dawat-o-islaah-server")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dawat_o_islaah.settings")

import django
django.setup()

from quran.models import CustomFont
from django.core.files import File

print("Existing fonts:")
for f in CustomFont.objects.all():
    print(f'  id={f.id} name="{f.name}" file="{f.file}" active={f.is_active}')

new_font = CustomFont(
    name="KFGQPC Hafs",
    is_active=True
)
new_font.file.name = "custom_fonts/Hafs.ttf"
new_font.save()
print(f'\nCreated and activated: {new_font.name} -> {new_font.file}')

print("\nAfter update:")
for f in CustomFont.objects.all():
    print(f'  id={f.id} name="{f.name}" file="{f.file}" active={f.is_active}')
