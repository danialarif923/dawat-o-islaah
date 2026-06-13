import json

out_lines = []

with open("assets/languages/en.json", "r", encoding="utf-8") as f:
    en_data = json.load(f)

hcn = en_data.get("hadithChapterNames", {})
bukhari = hcn.get("sahih-bukhari", {})
out_lines.append(f"Bukhari chapters in en.json: {len(bukhari)}")

for i in range(88, 100):
    ch = bukhari.get(str(i), "NOT FOUND")
    out_lines.append(f"  ch {i}: {ch[:80]}")

# Also write ur.json missing chapters for bukhari
with open("assets/languages/ur.json", "r", encoding="utf-8") as f:
    ur_data = json.load(f)

ur_hcn = ur_data.get("hadithChapterNames", {})
ur_bukhari = ur_hcn.get("sahih-bukhari", {})
out_lines.append(f"\nBukhari chapters in ur.json: {len(ur_bukhari)}")
missing = [(k, v) for k, v in sorted(ur_bukhari.items(), key=lambda x: int(x[0])) if not v]
out_lines.append(f"Empty chapters: {[k for k, v in missing]}")
out_lines.append(f"Filled chapters: {len(ur_bukhari) - len(missing)}")

with open(r"C:\Users\hp\AppData\Local\Temp\opencode\chapters_info.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))
print("Done")
