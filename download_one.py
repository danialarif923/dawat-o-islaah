import urllib.request
import sys

url = sys.argv[1]
outpath = sys.argv[2]

req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
resp = urllib.request.urlopen(req, timeout=600)
data = resp.read()
with open(outpath, "wb") as f:
    f.write(data)
print(f"{outpath}: {len(data)} bytes OK")
