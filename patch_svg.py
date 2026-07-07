import os

path = '/home/ubuntu/apps/dawat-o-islaah-server/quran/views.py'
with open(path, 'r') as f:
    content = f.read()

old_str = '''    if not os.path.exists(db_path):
        return JsonResponse({"error": f"Layout data not found for: {layout}"}, status=404)'''

new_str = '''    if layout == 'svg-mushaf':
        svg_dir = os.path.join(mushaf_data_dir, 'svg-mushaf', 'ligature-basd-svg')
        svg_path = os.path.join(svg_dir, f'{page_num}.svg')
        if not os.path.exists(svg_path):
            return JsonResponse({"error": f"SVG not found for page: {page_num}"}, status=404)
        with open(svg_path, 'r', encoding='utf-8') as svg_f:
            svg_content = svg_f.read()
        return JsonResponse({"page": page_num, "total_pages": 604, "is_svg": True, "svg": svg_content})

    if not os.path.exists(db_path):
        return JsonResponse({"error": f"Layout data not found for: {layout}"}, status=404)'''

if old_str in content:
    content = content.replace(old_str, new_str)
    with open(path, 'w') as f:
        f.write(content)
    print("Patched views.py for SVG support")
else:
    print("String not found in views.py")
