import json, os
d = r'C:\Users\hp\Desktop\dawat-o-islaah\dawat-o-islaah\scraped_data'
for f in os.listdir(d):
    if f.endswith('.json'):
        path = os.path.join(d, f)
        with open(path, encoding='utf-8') as fp:
            data = json.load(fp)
        print(f"{f}: {len(data)} hadiths")
        if data:
            nums = [h['hadith_number'] for h in data]
            print(f"  Range: #{min(nums)} - #{max(nums)}")

for f in os.listdir(d):
    if f.startswith('progress_'):
        path = os.path.join(d, f)
        with open(path) as fp:
            content = fp.read().strip()
        print(f"{f}: {content}")
