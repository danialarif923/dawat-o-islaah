import urllib.request, sys, re
sys.stdout.reconfigure(encoding='utf-8')

def check_eng(slug, num):
    url = 'https://al-hadees.com/%s/%d' % (slug, num)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode('utf-8', errors='replace')
    pat = r'<textarea[^>]*[Ii][Dd]="content-eng-%d"[^>]*>(.*?)</textarea>' % num
    m = re.search(pat, html, re.DOTALL)
    if m:
        text = m.group(1).strip()
        return len(text) > 10, len(text)
    return False, 0

tests = [('Mustadrak', 'mustadrak', 100), ('Mustadrak', 'mustadrak', 5000),
         ('Darimi', 'sunan-darmi', 100), ('Darimi', 'sunan-darmi', 2000),
         ('Ahmad', 'musnad-ahmed', 100), ('Ahmad', 'musnad-ahmed', 1000),
         ('Ibn Khuzaymah', 'sahih-ibn-khuzaymah', 100)]

for book, slug, num in tests:
    ok, length = check_eng(slug, num)
    print('%s (hadith %d): has_eng=%s length=%d' % (book, num, ok, length))
