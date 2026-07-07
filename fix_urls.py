content = open('/home/ubuntu/apps/dawat-o-islaah-server/quran/urls.py').read()
lines = content.split('\n')
# Find the broken word-timings line and fix it
for i, line in enumerate(lines):
    if 'word-timings' in line:
        lines[i] = '    path("api/word-timings/", views.get_word_timings, name="get_word_timings"),'
        break
else:
    # If not found, insert before the last closing bracket
    for i in reversed(range(len(lines))):
        if ']' in lines[i]:
            lines.insert(i-1, '    path("api/word-timings/", views.get_word_timings, name="get_word_timings"),')
            break
open('/home/ubuntu/apps/dawat-o-islaah-server/quran/urls.py', 'w').write('\n'.join(lines))
print('Fixed')
