import os, sys
sys.path.insert(0, '/home/ubuntu/apps/dawat-o-islaah-server')
os.environ['DJANGO_SETTINGS_MODULE'] = 'dawat_o_islaah.settings'
import django
django.setup()
from quran.admin import TranslationAdmin
from quran.models import Translation

# Check the Media class
print('TranslationAdmin Media JS:', TranslationAdmin.Media.js)
print('TranslationAdmin Media CSS:', TranslationAdmin.Media.css)

# Render the media
admin_instance = TranslationAdmin(Translation, None)
media = admin_instance.media
print('Rendered media:', media)
print()
# Check what JS URLs are rendered
for js in media.render_js():
    print('JS URL:', js)
