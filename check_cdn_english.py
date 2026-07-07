"""Check fawazahmed0 hadith-api CDN for English editions"""
import urllib.request, json

base = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions"

# Check for English editions of our books
editions = [
    "eng-darimi",
    "eng-malik",
    "eng-ahmed",
    "eng-mustadrak",
    "eng-ibnkhuzaymah",
    "eng-musnad-ahmad",
    "eng-sunan-darimi",
    "eng-muwatta-malik",
    "eng-mustadrak-al-hakim",
    "eng-sahih-ibn-khuzaymah",
]

for e in editions:
    url = f"{base}/{e}.min.json"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read().decode("utf-8"))
        count = len(data.get("hadiths", []))
        print(f"{e}: EXISTS ({count} hadiths)")
    except urllib.error.HTTPError as e:
        print(f"{e}: {e.code}")
    except Exception as ex:
        print(f"{e}: {ex}")
