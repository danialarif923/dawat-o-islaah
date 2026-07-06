import requests
import time
from django.core.management.base import BaseCommand, CommandParser
from django.db import transaction
from hadith.models import Hadith, SyncStatus, Book, Chapter, Baab

API_KEY = "$2y$10$d4nL2E660zHHBrwTB7Bviu3WvW5sToLRBWFbJ1yhn7rJzSuNpA0S"
BASE_URL = "https://hadithapi.com/api/hadiths"


class Command(BaseCommand):
    help = "Enterprise-level Hadith Sync System with Chapters & Baabs"

    def add_arguments(self, parser: CommandParser):
        parser.add_argument(
            "--book",
            type=str,
            help="Book slug to sync (e.g. musnad-ahmad). Omit to sync all books.",
        )

    def handle(self, *args, **options):
        book_filter = options.get("book")

        sync_status, _ = SyncStatus.objects.get_or_create(
            name="hadith_sync",
            defaults={"last_page": 1}
        )

        page = sync_status.last_page
        total_created = 0

        book_chapter_map = {}
        book_baab_map = {}
        book_seq_map = {}

        while True:
            self.stdout.write(f"Syncing page {page}...")

            params = {"apiKey": API_KEY, "page": page, "paginate": 200}
            if book_filter:
                params["book"] = book_filter

            try:
                for attempt in range(3):
                    try:
                        response = requests.get(BASE_URL, params=params, timeout=30)
                        break
                    except requests.exceptions.RequestException:
                        self.stdout.write(self.style.WARNING(f"Retry {attempt+1}/3 failed..."))
                        time.sleep(2)
                else:
                    self.stdout.write(self.style.ERROR(f"Skipping page {page} due to network failure"))
                    page += 1
                    continue

                if response.status_code != 200:
                    self.stdout.write(self.style.WARNING(f"API Error: {response.status_code}"))
                    break

                data = response.json()

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Request failed: {str(e)}"))
                break

            hadith_list = data.get("hadiths", {}).get("data", [])

            if not hadith_list:
                break

            objects_to_create = []

            for item in hadith_list:
                book_slug = item.get("bookSlug")

                book_obj, _ = Book.objects.get_or_create(
                    name=book_slug,
                    defaults={"order": 0}
                )

                if book_obj.id not in book_seq_map:
                    book_seq_map[book_obj.id] = 1
                if book_obj.id not in book_chapter_map:
                    book_chapter_map[book_obj.id] = {}
                if book_obj.id not in book_baab_map:
                    book_baab_map[book_obj.id] = {}

                raw_number = item.get("hadithNumber")
                try:
                    if isinstance(raw_number, str) and "," in raw_number:
                        raw_number = raw_number.split(",")[0].strip()
                    hadith_number = int(raw_number)
                except (TypeError, ValueError):
                    continue

                chapter_data = item.get("chapter", {})
                if isinstance(chapter_data, dict):
                    chapter_number_str = chapter_data.get("chapterNumber", "0")
                    try:
                        chapter_number = int(chapter_number_str)
                    except (ValueError, TypeError):
                        chapter_number = 0

                    chapter_english = chapter_data.get("chapterEnglish", "")
                    chapter_arabic = chapter_data.get("chapterArabic", "")
                    chapter_urdu = chapter_data.get("chapterUrdu", "")
                else:
                    chapter_number = 0
                    chapter_english = chapter_data or ""
                    chapter_arabic = ""
                    chapter_urdu = ""

                chapter_key = chapter_number
                if chapter_key not in book_chapter_map[book_obj.id]:
                    chapter_obj, _ = Chapter.objects.get_or_create(
                        book=book_obj,
                        chapter_number=chapter_number,
                        defaults={
                            "chapter_english": chapter_english,
                            "chapter_arabic": chapter_arabic,
                            "chapter_urdu": chapter_urdu,
                        }
                    )
                    book_chapter_map[book_obj.id][chapter_key] = chapter_obj
                else:
                    chapter_obj = book_chapter_map[book_obj.id][chapter_key]

                heading_english = item.get("headingEnglish") or ""
                heading_urdu = item.get("headingUrdu") or ""
                heading_arabic = item.get("headingArabic") or ""

                baab_obj = None
                if heading_english or heading_urdu:
                    baab_key = f"{heading_english}|{heading_urdu}"
                    if baab_key not in book_baab_map[book_obj.id]:
                        baab_obj, _ = Baab.objects.get_or_create(
                            book=book_obj,
                            chapter=chapter_obj,
                            baab_name_urdu=heading_urdu or heading_english,
                            defaults={
                                "chapter_english": chapter_english,
                                "baab_name_english": heading_english or heading_urdu,
                                "start_hadith_number": hadith_number,
                                "end_hadith_number": hadith_number,
                            }
                        )
                        book_baab_map[book_obj.id][baab_key] = baab_obj
                    else:
                        baab_obj = book_baab_map[book_obj.id][baab_key]
                        if hadith_number > baab_obj.end_hadith_number:
                            Baab.objects.filter(id=baab_obj.id).update(end_hadith_number=hadith_number)
                            baab_obj.end_hadith_number = hadith_number

                sequential_id = book_seq_map[book_obj.id]
                book_seq_map[book_obj.id] += 1

                objects_to_create.append(
                    Hadith(
                        book=book_obj,
                        chapter_number=chapter_number,
                        chapter_english=chapter_english,
                        chapter_arabic=chapter_arabic,
                        chapter_urdu=chapter_urdu,
                        hadith_number=hadith_number,
                        chapter_hadith_id=sequential_id,
                        baab=baab_obj,
                        arabic_text=item.get("hadithArabic"),
                        english_text=item.get("hadithEnglish"),
                        urdu_text=item.get("hadithUrdu"),
                        reference=item.get("reference") or "",
                    )
                )

            with transaction.atomic():
                Hadith.objects.bulk_create(
                    objects_to_create,
                    ignore_conflicts=True
                )

            total_created += len(objects_to_create)

            sync_status.last_page = page
            sync_status.save()

            page += 1
            time.sleep(1)

        self.stdout.write(self.style.SUCCESS(
            f"Sync completed. Total processed: {total_created}"
        ))
