import re

path = "/home/ubuntu/apps/dawat-o-islaah-server/quran/views.py"

with open(path, "r") as f:
    content = f.read()

old = """    base_url = f"{request.scheme}://{request.get_host()}"

    for font in fonts:
        css_lines.append(
            f\"\"\"@font-face {{
    font-family: '{font.name}';
    src: url('{base_url}{font.file.url}');"""

new = """    for font in fonts:
        css_lines.append(
            f\"\"\"@font-face {{
    font-family: '{font.name}';
    src: url('{font.file.url}');"""

if old in content:
    content = content.replace(old, new)
    with open(path, "w") as f:
        f.write(content)
    print("Fixed font URL in views.py")
else:
    print("Could not find the pattern to replace")
    print("Looking for alternative pattern...")
    # Try to find the relevant lines
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'base_url' in line and 'request.get_host' in line:
            print(f"  Line {i+1}: {line}")
        if 'src: url' in line and 'base_url' in line:
            print(f"  Line {i+1}: {line}")
