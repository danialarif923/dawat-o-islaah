import urllib.request, sys, re
sys.stdout.reconfigure(encoding='utf-8')
url = 'https://al-hadees.com/sahih-ibn-khuzaymah/100'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
html = resp.read().decode('utf-8', errors='replace')
pat_eng = r'<textarea[^>]*[Ii][Dd]="content-eng-100"[^>]*>(.*?)</textarea>'
pat_urd = r'<textarea[^>]*[Ii][Dd]="content-urd-100"[^>]*>(.*?)</textarea>'
m_eng = re.search(pat_eng, html, re.DOTALL)
m_urd = re.search(pat_urd, html, re.DOTALL)
print('Ibn Khuzaymah #100:')
print('  Has English:', m_eng is not None and len(m_eng.group(1).strip()) > 0)
print('  Has Urdu:', m_urd is not None and len(m_urd.group(1).strip()) > 0)
if m_urd:
    print('  Urdu text:', m_urd.group(1).strip()[:80])
# Check overall page length
print('  Page length:', len(html))
