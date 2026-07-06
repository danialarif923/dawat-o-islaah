"""
Import hadith-json data (Arabic + English) from AhmedBaset/hadith-json GitHub repo.

Combines with Urdu from al-hadees.com scraped data when available.

Usage:
  python manage.py import_hadith_json --book=ahmad --hadith_json=path/to/ahmed.json --alhadees=path/to/ahmad.json
  python manage.py import_hadith_json --book=ahmad --hadith_json=path/to/ahmed.json
  python manage.py import_hadith_json --book=mustadrak --alhadees=path/to/mustadrak.json
"""
import json
from django.core.management.base import BaseCommand
from django.db import transaction
from hadith.models import Hadith, Book


BOOK_MAP = {
    "ahmad": {"name": "musnad-ahmad", "order": 8},
    "darmi": {"name": "sunan-darimi", "order": 9},
    "malik": {"name": "muwatta-malik", "order": 10},
    "mustadrak": {"name": "mustadrak-al-hakim", "order": 11},
    "ibnkhuzaymah": {"name": "sahih-ibn-khuzaymah", "order": 12},
}


class Command(BaseCommand):
    help = "Import hadith data from hadith-json and al-hadees.com JSON files"

    def add_arguments(self, parser):
        parser.add_argument("--book", required=True, help="Book key (ahmad, darmi, malik, mustadrak, ibnkhuzaymah)")
        parser.add_argument("--hadith-json", help="Path to hadith-json file (Arabic+English)")
        parser.add_argument("--alhadees", help="Path to al-hadees.com scraped JSON (Urdu)")

    def handle(self, *args, **options):
        book_key = options["book"]
        hj_path = options.get("hadith_json")
        alhadees_path = options.get("alhadees")

        if book_key not in BOOK_MAP:
            self.stderr.write(f"Unknown book: {book_key}. Options: {', '.join(BOOK_MAP.keys())}")
            return

        book_info = BOOK_MAP[book_key]

        # Load hadith-json data (Arabic + English)
        hj_hadiths = []
        hj_chapters = []
        if hj_path:
            with open(hj_path, encoding="utf-8") as f:
                hj_data = json.load(f)
            hj_hadiths = hj_data.get("hadiths", [])
            hj_chapters = hj_data.get("chapters", [])
            self.stdout.write(f"Loaded {len(hj_hadiths)} hadiths from hadith-json")

        # Build chapter lookup
        chapter_lookup = {}
        for ch in hj_chapters:
            ch_id = ch.get("id")
            chapter_lookup[ch_id] = ch

        # Load al-hadees.com scraped data (Urdu)
        alhadees_hadiths = {}
        if alhadees_path:
            with open(alhadees_path, encoding="utf-8") as f:
                al_data = json.load(f)
            for h in al_data:
                num = h.get("hadith_number")
                alhadees_hadiths[num] = h
            self.stdout.write(f"Loaded {len(al_data)} hadiths from al-hadees.com")

        # Get or create Book
        book_obj, created = Book.objects.get_or_create(
            name=book_info["name"],
            defaults={"order": book_info["order"]}
        )
        if created:
            self.stdout.write(f"Created book: {book_info['name']}")
        else:
            book_obj.order = book_info["order"]
            book_obj.save()

        # Import
        created_count = 0
        updated_count = 0
        skipped = 0

        with transaction.atomic():
            # Import from hadith-json (preferred source)
            for h in hj_hadiths:
                hadith_num = h.get("idInBook")
                if not hadith_num:
                    continue

                arabic = h.get("arabic", "") or ""
                eng_raw = h.get("english", {}) or {}
                english = eng_raw.get("text", "") if isinstance(eng_raw, dict) else ""
                ch_id = h.get("chapterId")

                # Chapter info
                ch = chapter_lookup.get(ch_id, {})
                chapter_english = ch.get("english", "") or ""
                chapter_arabic = ch.get("arabic", "") or ""

                # Urdu from al-hadees.com
                al = alhadees_hadiths.get(hadith_num, {})
                urdu = al.get("urdu_text", "") or ""

                hadith, was_created = Hadith.objects.update_or_create(
                    book=book_obj,
                    hadith_number=hadith_num,
                    defaults={
                        "chapter_english": chapter_english,
                        "chapter_arabic": chapter_arabic,
                        "arabic_text": arabic,
                        "english_text": english,
                        "urdu_text": urdu,
                    }
                )
                if was_created:
                    created_count += 1
                else:
                    updated_count += 1

            # Import remaining from al-hadees.com (not in hadith-json)
            for num, al in alhadees_hadiths.items():
                if any(h.get("idInBook") == num for h in hj_hadiths):
                    continue  # already imported above

                arabic = al.get("arabic_text", "") or ""
                urdu = al.get("urdu_text", "") or ""
                chapter = al.get("chapter_name", "") or ""
                grade = al.get("grade", "") or ""

                hadith, was_created = Hadith.objects.update_or_create(
                    book=book_obj,
                    hadith_number=num,
                    defaults={
                        "chapter_arabic": chapter,
                        "arabic_text": arabic,
                        "urdu_text": urdu,
                        "reference": grade,
                    }
                )
                if was_created:
                    created_count += 1
                else:
                    updated_count += 1
                skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done {book_info['name']}: {created_count} created, {updated_count} updated, {len(hj_hadiths) - created_count} skipped"
        ))
