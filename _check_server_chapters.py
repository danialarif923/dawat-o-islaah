import json, sys, urllib.request

for slug in ["musnad-ahmad", "sunan-darimi", "muwatta-malik", "mustadrak-al-hakim", "sahih-ibn-khuzaymah"]:
    url = f"http://localhost:8000/get-chapters/?book={slug}"
    with urllib.request.urlopen(url) as resp:
        d = json.loads(resp.read())
    chapters = d.get("chapters", [])
    print(f"{slug}: {len(chapters)} chapters")
    if chapters:
        print(f"  first: {chapters[0]['chapterEnglish'][:50]}")
        print(f"  last:  {chapters[-1]['chapterEnglish'][:50]}")
