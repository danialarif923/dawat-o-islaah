import urllib.request, os, json

books = ["darimi.json", "ahmad.json", "malik.json", "hakim.json", "ibnkhuzaymah.json"]
outdir = "hadithunlocked_data"
os.makedirs(outdir, exist_ok=True)

for b in books:
    url = f"https://www.hadithunlocked.com/{b}"
    path = os.path.join(outdir, b)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=60)
        data = resp.read()
        with open(path, "wb") as f:
            f.write(data)
        print(f"{b}: {len(data)} bytes OK")
    except Exception as e:
        print(f"{b}: FAILED - {e}")
