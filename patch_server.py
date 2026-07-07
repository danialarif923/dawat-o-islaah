"""
Server-side patching script. Run this on the server to:
1. Add WordRoot model import to quran/models.py
2. Add search_by_root view import to quran/views.py
3. Create and apply migrations
4. Print next steps

Usage on server:
  cd /home/ubuntu/apps/dawat-o-islaah-server
  python patch_server.py
"""
import os
import sys

DJANGO_DIR = "/home/ubuntu/apps/dawat-o-islaah-server"
MODELS_PATH = os.path.join(DJANGO_DIR, "quran", "models.py")
VIEWS_PATH = os.path.join(DJANGO_DIR, "quran", "views.py")
ROOT_MODELS_SRC = os.path.join(os.path.dirname(__file__), "quran", "root_models.py")
ROOT_SEARCH_SRC = os.path.join(os.path.dirname(__file__), "quran", "root_search.py")
ROOT_MODELS_DST = os.path.join(DJANGO_DIR, "quran", "root_models.py")
ROOT_SEARCH_DST = os.path.join(DJANGO_DIR, "quran", "root_search.py")


def ensure_line(filepath, line, marker=None):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    if line in content:
        print(f"  Already present: {line.strip()}")
        return False
    if marker:
        old = marker
        new = marker + "\n" + line
        if old in content:
            content = content.replace(old, new)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"  Added after marker: {line.strip()}")
            return True
    with open(filepath, "a", encoding="utf-8") as f:
        f.write("\n" + line)
    print(f"  Appended: {line.strip()}")
    return True


def main():
    print("=" * 60)
    print("Patching server for Root Word Search")
    print("=" * 60)

    print("\n1. Copying root_models.py and root_search.py...")
    import shutil
    for src, dst in [(ROOT_MODELS_SRC, ROOT_MODELS_DST), (ROOT_SEARCH_SRC, ROOT_SEARCH_DST)]:
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"  Copied {src} → {dst}")
        else:
            print(f"  Source not found: {src}")

    print("\n2. Patching quran/models.py...")
    if os.path.exists(MODELS_PATH):
        ensure_line(
            MODELS_PATH,
            "from quran.root_models import WordRoot",
            marker="from django.db import models",
        )
    else:
        print(f"  ERROR: {MODELS_PATH} not found!")

    print("\n3. Patching quran/views.py...")
    if os.path.exists(VIEWS_PATH):
        ensure_line(
            VIEWS_PATH,
            "from quran.root_search import search_by_root",
            marker="from django.http import JsonResponse",
        )
    else:
        print(f"  ERROR: {VIEWS_PATH} not found!")

    print("\n4. Creating and applying migrations...")
    os.chdir(DJANGO_DIR)
    os.system("source venv/bin/activate && python manage.py makemigrations quran")
    os.system("source venv/bin/activate && python manage.py migrate quran")

    print("\n5. Importing word root data...")
    os.system("source venv/bin/activate && python manage.py import_word_roots")

    print("\n" + "=" * 60)
    print("Server patching complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Run rewrite_urls.py locally to update URL routes")
    print("  2. Rebuild frontend: npm run build")
    print("  3. Deploy dist/ to server")
    print("  4. Restart server (touch wsgi.py or restart supervisor)")


if __name__ == "__main__":
    main()
