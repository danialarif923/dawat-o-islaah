import os

path = '/home/ubuntu/apps/dawat-o-islaah-server/quran/views.py'
with open(path, 'r') as f:
    content = f.read()

old_str = '''    words_db_path = os.path.join(layout_dir, "indopak-nastaleeq.db")

    if not os.path.exists(db_path):
        return JsonResponse({"error": f"Layout data not found for: {layout}"}, status=404)

    if not os.path.exists(words_db_path):
        return JsonResponse({"error": f"Word data not found for layout: {layout}"}, status=404)'''

new_str = '''    words_db_name = "qpc-nastaleeq.db" if "qpc" in layout or "qatar" in layout else "indopak-nastaleeq.db"
    words_db_path = os.path.join(mushaf_data_dir, words_db_name)

    if not os.path.exists(db_path):
        return JsonResponse({"error": f"Layout data not found for: {layout}"}, status=404)

    if not os.path.exists(words_db_path):
        return JsonResponse({"error": f"Word data not found for layout: {layout} at {words_db_path}"}, status=404)'''

if old_str in content:
    content = content.replace(old_str, new_str)
    with open(path, 'w') as f:
        f.write(content)
    print("Patched successfully.")
else:
    print("Could not find string to replace.")
