import re

with open("/home/ubuntu/apps/dawat-o-islaah-server/hadith/urls.py", "r") as f:
    content = f.read()

content = re.sub(r"path\('api/chapters-for-book/'.*", "", content)

with open("/home/ubuntu/apps/dawat-o-islaah-server/hadith/urls.py", "w") as f:
    f.write(content)

print("Done - removed chapters-for-book route")
