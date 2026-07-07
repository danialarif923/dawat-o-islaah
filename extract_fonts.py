import re

path = r'C:\Users\hp\.gemini\antigravity-ide\brain\f84d7ac1-f6fc-48c3-a08b-9787a0e08021\.system_generated\steps\268\content.md'
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()
urls = re.findall(r'(https?://[^\s\"\'<>]+)', html)
for u in set(urls):
    if 'font' in u or 'woff' in u or 'ttf' in u:
        print(u)
