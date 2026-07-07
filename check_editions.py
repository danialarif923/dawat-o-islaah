import urllib.request, json

url = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.min.json"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
resp = urllib.request.urlopen(req, timeout=15)
data = json.loads(resp.read().decode("utf-8"))

# Print first 50 keys
for i, key in enumerate(data.keys()):
    print(key)
    if i >= 50:
        break
