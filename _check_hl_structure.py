import json

with open("hadithunlocked_data/ahmad.json", encoding="utf-8") as f:
    hl = json.load(f)
chapters = hl["chapters"]
print("Chapters:", len(chapters))
for i, c in enumerate(chapters):
    title = c.get("title", {})
    if isinstance(title, dict):
        ch_en = title.get("en", "")
        ch_ar = title.get("ar", "")
    else:
        ch_en = str(title)
        ch_ar = ""
    
    has_items = "items" in c
    has_sections = bool(c.get("sections"))
    items_count = len(c.get("items",[]))
    
    sec_en = ""
    if c.get("sections"):
        s = c["sections"][0]
        st = s.get("title", {})
        if isinstance(st, dict):
            sec_en = st.get("en", "")
    
    print(f"Ch{i}: en={ch_en.encode('ascii','replace')[:30]} | items={has_items} items={items_count} | sec={has_sections} sec_en={sec_en.encode('ascii','replace')[:30]}")
