import re, os, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Read the saved page and check headers
for num in [1, 2, 3]:
    path = f'C:\\Users\\hp\\Desktop\\dawat-o-islaah\\dawat-o-islaah\\page_{num}.html'
    if not os.path.exists(path):
        print(f"#{num}: file not found")
        continue
    with open(path, encoding='utf-8') as f:
        html = f.read()
    matches = re.findall(r'<h[1-3][^>]*>(.*?)</h[1-3]>', html, re.DOTALL)
    print(f"#{num}: {len(matches)} H1-H3 headers")
    for i, m in enumerate(matches):
        text = re.sub(r'<[^>]+>', '', m).strip()
        text = re.sub(r'\s+', ' ', text)
        # Truncate for display but show length
        display = text[:60] + '...' if len(text) > 60 else text
        print(f"  H{i+1}: [{len(text)} chars] {display}")
    print()
