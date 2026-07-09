import os, sys
sys.path.insert(0, '/home/ubuntu/apps/dawat-o-islaah-server')
os.environ['DJANGO_SETTINGS_MODULE'] = 'dawat_o_islaah.settings'
import django
django.setup()
from django.test import Client
from django.contrib.auth import get_user_model
from quran.models import Ayat
User = get_user_model()
user = User.objects.filter(is_superuser=True).first()
if not user:
    print('No superuser')
    sys.exit(1)
client = Client(HTTP_HOST='localhost')
client.force_login(user)
first = Ayat.objects.first()
if not first:
    print('No ayat')
    sys.exit(1)
resp = client.get('/admin/quran/ayat/%d/change/' % first.pk)
html = resp.content.decode()
if 'ckeditor_font_loader' in html:
    print('FONT LOADER SCRIPT FOUND')
    import re
    for m in re.finditer(r'<script[^>]*src="([^"]*ckeditor_font_loader[^"]*)"[^>]*>', html):
        print('Script src:', m.group(1))
    print('Occurrences:', html.count('ckeditor_font_loader'))
else:
    print('FONT LOADER SCRIPT NOT FOUND')
    print('Status:', resp.status_code)
    print('Has ckeditor:', 'ckeditor' in html.lower())
