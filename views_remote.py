from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from quran.root_search import search_by_root
from django.conf import settings
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
from django.db.models.functions import Upper
import json, os, requests  # Added requests

from .models import Ayat, Tafseer, Translation, AyatAudio, CustomFont, Author, WordTiming
from django.utils.html import strip_tags
from django.db.models import Q

# =====================================================
# QURAN API PROXY (Bypasses CORS for Search Hydration)
# =====================================================

@require_http_methods(["GET"])
def quran_ayah_proxy(request, ayah_number, edition):
    """
    Proxies requests to alquran.cloud to bypass CORS restrictions 
    in the browser during search result hydration.
    """
    url = f"https://api.alquran.cloud/v1/ayah/{ayah_number}/{edition}"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return JsonResponse(response.json())
        return JsonResponse({"error": "External API error"}, status=response.status_code)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# =====================================================
# TRANSLATION AUTHORS (Backend Driven)
# =====================================================

@require_http_methods(["GET"])
def get_translation_authors(request):
    language = request.GET.get("language")
    if not language:
        return JsonResponse({"error": "language required"}, status=400)

    authors = (
        Author.objects
        .filter(translations__language=language, author_type__in=["translation", "both"])
        .distinct()
        .order_by("order_weight", "name")
    )

    return JsonResponse({"authors": [a.name.upper() for a in authors]})


# =====================================================
# TAFSEER AUTHORS (Backend Driven)
# =====================================================

@require_http_methods(["GET"])
def get_tafseer_authors(request):
    language = request.GET.get("language")
    if not language:
        return JsonResponse({"error": "language required"}, status=400)

    authors = (
        Author.objects
        .filter(tafseers__language=language, author_type__in=["tafsir", "both"])
        .distinct()
        .order_by("order_weight", "name")
    )

    return JsonResponse({"authors": [a.name.upper() for a in authors]})


# =====================================================
# QARIS (Audio Authors)
# =====================================================

@require_http_methods(["GET"])
def get_qaris(request):
    qaris = (
        AyatAudio.objects
        .annotate(qari_upper=Upper("qari_name"))
        .values_list("qari_upper", flat=True)
        .distinct()
        .order_by("qari_upper")
    )
    return JsonResponse({"qaris": list(qaris)})


# =====================================================
# TRANSLATIONS (Per Surah)
# =====================================================

@require_http_methods(["GET"])
def get_translations(request):
    surah = request.GET.get("surah")
    language = request.GET.get("language")

    if not surah or not language:
        return JsonResponse({"error": "surah and language required"}, status=400)

    try:
        surah = int(surah)
    except ValueError:
        return JsonResponse({"error": "Invalid surah number"}, status=400)

    translations = (
        Translation.objects
        .filter(surah=surah, language=language)
        .select_related('author')
        .order_by("author__order_weight", "ayat_number")
    )

    data = [
        {
            "ayah": t.ayat_number,
            "text": t.text,
            "author": t.author.name.upper(),
        }
        for t in translations
    ]

    return JsonResponse(data, safe=False)


# =====================================================
# SINGLE TRANSLATION (Per Ayah + Author)
# =====================================================

@require_http_methods(["GET"])
def get_translation(request):
    surah = request.GET.get("surah")
    ayah = request.GET.get("ayah")
    author_name = request.GET.get("author")
    language = request.GET.get("language")

    if not surah or not ayah or not author_name:
        return JsonResponse({"error": "surah, ayah and author required"}, status=400)

    try:
        query = {
            "surah": int(surah) if str(surah).isdigit() else surah,
            "ayat_number": int(ayah) if str(ayah).isdigit() else ayah,
            "author__name__iexact": author_name,
        }

        if language:
            query["language"] = language

        translation = Translation.objects.get(**query)

        return JsonResponse({
            "surah": surah,
            "ayah": ayah,
            "author": translation.author.name.upper(),
            "language": translation.language,
            "translation": translation.text
        })

    except Translation.DoesNotExist:
        return JsonResponse({"error": "Translation not found"}, status=404)
    except Translation.MultipleObjectsReturned:
        return JsonResponse({"error": "Multiple translations found. Specify language."}, status=400)


# =====================================================
# TAFSEER (Per Ayah + Author)
# =====================================================

@require_http_methods(["GET"])
def get_tafseer(request):
    surah = request.GET.get("surah")
    ayah = request.GET.get("ayah")
    author_name = request.GET.get("author")
    language = request.GET.get("language")

    if not all([surah, ayah, author_name, language]):
        return JsonResponse({"error": "Missing params"}, status=400)

    try:
        surah = int(surah)
        ayah = int(ayah)
    except ValueError:
        return JsonResponse({"error": "Invalid surah or ayah"}, status=400)

    try:
        tafseer = Tafseer.objects.get(
            surah=surah,
            ayat_number=ayah,
            author__name__iexact=author_name,
            language__iexact=language,
        )

        return JsonResponse({"tafseer": tafseer.text})

    except Tafseer.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)

# =====================================================
# FULL SURAH TAFSEER (Per Author + Language)
# =====================================================
@require_http_methods(["GET"])
def get_full_surah_tafseer(request):
    surah = request.GET.get("surah")
    author_name = request.GET.get("author")
    language = request.GET.get("language")

    if not all([surah, author_name, language]):
        return JsonResponse({"error": "Missing params"}, status=400)

    try:
        surah = int(surah)
    except ValueError:
        return JsonResponse({"error": "Invalid surah number"}, status=400)

    tafseers = Tafseer.objects.filter(
        surah=surah,
        author__name__iexact=author_name,
        language__iexact=language,
    ).order_by("ayat_number")

    data = {t.ayat_number: t.text for t in tafseers}

    return JsonResponse(data)

# =====================================================
# SURAH AUDIO (Grouped by Qari)
# =====================================================

@require_http_methods(["GET"])
def get_surah_audios(request):
    surah = request.GET.get("surah")

    if not surah:
        return JsonResponse({"error": "surah required"}, status=400)

    try:
        surah = int(surah)
    except ValueError:
        return JsonResponse({"error": "Invalid surah number"}, status=400)

    audios = AyatAudio.objects.filter(ayat__surah=surah)

    data = [
        {
            "ayah": audio.ayat.ayat_number,
            "qari_name": audio.qari_name.upper(),
            "audio_url": audio.audio_url or (
                audio.audio_file.url if audio.audio_file else None
            ),
        }
        for audio in audios
    ]

    return JsonResponse(data, safe=False)


# =====================================================
# FONTS
# =====================================================

@never_cache
def get_custom_fonts(request):
    active_font = CustomFont.objects.filter(is_active=True).first()
    return JsonResponse({
        "active_font": active_font.name if active_font else "serif"
    })

@never_cache
def custom_fonts_css(request):
    fonts = CustomFont.objects.filter(is_active=True)
    css_lines = []
    for font in fonts:
        css_lines.append(
            f"""@font-face {{
    font-family: '{font.name}';
    src: url('{font.file.url}');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}}"""
        )

    css_content = "\n".join(css_lines)
    return HttpResponse(css_content, content_type="text/css")


# =====================================================
# ARABIC AYAT
# =====================================================

def get_ayat(request):
    surah = request.GET.get("surah")
    ayat = request.GET.get("ayat")
    if not surah or not ayat:
        return JsonResponse({"error": "surah and ayat required"}, status=400)
    try:
        ayat_obj = Ayat.objects.get(surah=int(surah), ayat_number=int(ayat))
        return JsonResponse({"text": ayat_obj.text})
    except (Ayat.DoesNotExist, ValueError, TypeError):
        return JsonResponse({"text": ""})


def get_surah_ayat(request):
    surah_number = request.GET.get("surah")
    if not surah_number:
        return JsonResponse({"error": "surah parameter required"}, status=400)

    try:
        surah_num = int(surah_number)
    except (ValueError, TypeError):
        return JsonResponse({"error": "surah must be a number"}, status=400)

    ayahs = Ayat.objects.filter(surah=surah_num).order_by("ayat_number")
    data = [
        {
            "numberInSurah": ayat.ayat_number,
            "number": ayat.ayat_number,
            "text": ayat.text,
            "surah": ayat.surah,
        }
        for ayat in ayahs
    ]
    return JsonResponse({"ayahs": data, "count": len(data)})


@require_http_methods(["GET"])
def search_ayat(request):
    q = request.GET.get("q", "").strip()
    language = request.GET.get("language", "all").strip()
    surah = request.GET.get("surah", "").strip()
    ayah = request.GET.get("ayah", "").strip()
    page = request.GET.get("page", 1)

    if not q:
        return JsonResponse({"results": [], "total": 0, "page": 1, "per_page": 20, "total_pages": 0})

    # Search Arabic text
    arabic_matches = Ayat.objects.filter(text__icontains=q)
    if surah:
        try:
            arabic_matches = arabic_matches.filter(surah=int(surah))
        except ValueError:
            pass
    if ayah:
        try:
            arabic_matches = arabic_matches.filter(ayat_number=int(ayah))
        except ValueError:
            pass

    # Search translations
    translation_matches = Translation.objects.filter(text__icontains=q)
    if surah:
        try:
            translation_matches = translation_matches.filter(surah=int(surah))
        except ValueError:
            pass
    if ayah:
        try:
            translation_matches = translation_matches.filter(ayat_number=int(ayah))
        except ValueError:
            pass

    # Merge results by (surah, ayah_number)
    merged = {}

    for a in arabic_matches:
        key = (a.surah, a.ayat_number)
        if key not in merged:
            merged[key] = {"surah": {"number": a.surah}, "numberInSurah": a.ayat_number, "ar": strip_tags(a.text), "en": "", "ur": ""}

    for t in translation_matches:
        key = (t.surah, t.ayat_number)
        if key not in merged:
            try:
                ayat = Ayat.objects.get(surah=t.surah, ayat_number=t.ayat_number)
                merged[key] = {"surah": {"number": t.surah}, "numberInSurah": t.ayat_number, "ar": strip_tags(ayat.text), "en": "", "ur": ""}
            except Ayat.DoesNotExist:
                merged[key] = {"surah": {"number": t.surah}, "numberInSurah": t.ayat_number, "ar": "", "en": "", "ur": ""}

        if t.language == "en":
            merged[key]["en"] = t.text
        elif t.language == "ur":
            merged[key]["ur"] = t.text

    results_list = list(merged.values())
    results_list.sort(key=lambda x: (x["surah"]["number"], x["numberInSurah"]))

    # Apply language filter
    if language == "ar":
        results_list = [r for r in results_list if r["ar"] and q.lower() in r["ar"].lower()]
    elif language == "en":
        results_list = [r for r in results_list if r["en"] and q.lower() in r["en"].lower()]
    elif language == "ur":
        results_list = [r for r in results_list if r["ur"] and q.lower() in r["ur"].lower()]

    limited = results_list
    total = len(limited)

    return JsonResponse({
        "results": limited,
        "total": total,
    })


# =====================================================
# WORD TIMINGS (Word-by-Word Highlighting)
# =====================================================

@require_http_methods(['GET'])
def get_word_timings(request):
    surah = request.GET.get('surah')

    if not surah:
        return JsonResponse({'error': 'surah parameter required'}, status=400)

    try:
        surah_num = int(surah)
    except (ValueError, TypeError):
        return JsonResponse({'error': 'surah must be a number'}, status=400)

    timings = WordTiming.objects.filter(surah=surah_num).order_by('ayah_number', 'word_index')

    result = {}
    for t in timings:
        ayah_key = str(t.ayah_number)
        if ayah_key not in result:
            result[ayah_key] = []
        result[ayah_key].append({
            'word_index': t.word_index,
            'start_ms': t.start_ms,
            'end_ms': t.end_ms,
        })

    return JsonResponse({'surah': surah_num, 'timings': result})

import sqlite3
from django.conf import settings

import sqlite3


@require_http_methods(["GET"])
def get_mushaf_page(request):
    layout = request.GET.get("layout")
    page = request.GET.get("page", "1")

    if not layout:
        return JsonResponse({"error": "layout parameter is required"}, status=400)

    try:
        page_num = int(page)
    except ValueError:
        return JsonResponse({"error": "page must be a number"}, status=400)

    mushaf_data_dir = os.path.join(settings.BASE_DIR, "mushaf_data")
    if not os.path.isdir(mushaf_data_dir):
        mushaf_data_dir = os.path.join(settings.BASE_DIR.parent, "mushaf_data")
    layout_dir = os.path.join(mushaf_data_dir, layout)
    db_path = os.path.join(layout_dir, f"{layout}.db")
    words_db_name = "qpc-nastaleeq.db" if "qpc" in layout or "qatar" in layout else "indopak-nastaleeq.db"
    words_db_path = os.path.join(layout_dir, words_db_name)

    # Handle SVG layout (ligature-based SVG)
    if layout == "svg-mushaf":
        svg_filename = f"{page_num:03d}.svg"
        svg_path = os.path.join(layout_dir, svg_filename)
        if not os.path.exists(svg_path):
            return JsonResponse({"error": f"SVG not found for page: {page_num}"}, status=404)
        with open(svg_path, 'r', encoding='utf-8') as svg_f:
            svg_content = svg_f.read()
        return JsonResponse({"page": page_num, "total_pages": 604, "is_svg": True, "svg": svg_content})

    if not os.path.exists(db_path):
        return JsonResponse({"error": f"Layout data not found for: {layout}"}, status=404)

    if not os.path.exists(words_db_path):
        words_db_path = os.path.join(mushaf_data_dir, words_db_name)
        if not os.path.exists(words_db_path):
            return JsonResponse({"error": f"Word data not found for layout: {layout} at {words_db_path}"}, status=404)

    # Check if layout DB has a pre-baked 'pages' table
    has_pages = False
    try:
        _t = sqlite3.connect(db_path)
        _c = _t.cursor()
        _c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='pages'")
        if _c.fetchone():
            has_pages = True
        _t.close()
    except Exception:
        pass

    if not has_pages:
        # QPC-style layouts: build page lines from the 'words' table.
        # 'location' column format: page:line:word_position
        try:
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT id, location, surah, ayah, word, text FROM words ORDER BY id")
            all_words = cur.fetchall()
            conn.close()

            page_map = {}
            total_pages = 0
            for w in all_words:
                loc = w["location"] or "1:1:1"
                parts = str(loc).split(":")
                try:
                    pg = int(parts[0])
                    ln = int(parts[1]) if len(parts) > 1 else 1
                except Exception:
                    pg, ln = 1, 1
                page_map.setdefault(pg, {}).setdefault(ln, []).append({
                    "word_index": w["id"],
                    "text": w["text"],
                    "surah": w["surah"],
                    "ayah": w["ayah"],
                    "position": w["word"],
                })
                if pg > total_pages:
                    total_pages = pg

            if page_num not in page_map:
                return JsonResponse({"error": f"Page {page_num} not found for layout: {layout}"}, status=404)

            result_lines = []
            for ln in sorted(page_map[page_num].keys()):
                words_list = page_map[page_num][ln]
                first = words_list[0]
                result_lines.append({
                    "line_number": ln,
                    "line_type": "ayah",
                    "is_centered": False,
                    "surah_number": first["surah"],
                    "first_word_id": None,
                    "last_word_id": None,
                    "words": words_list,
                })

            return JsonResponse({
                "page": page_num,
                "total_pages": total_pages,
                "lines": result_lines,
            })
        except sqlite3.Error as e:
            return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    try:
        layout_conn = sqlite3.connect(db_path)
        layout_conn.row_factory = sqlite3.Row
        words_conn = sqlite3.connect(words_db_path)
        words_conn.row_factory = sqlite3.Row

        lc = layout_conn.cursor()
        wc = words_conn.cursor()

        lc.execute("SELECT COUNT(DISTINCT page_number) as total FROM pages")
        total_pages = lc.fetchone()["total"]

        lc.execute(
            "SELECT line_number, line_type, is_centered, first_word_id, last_word_id, surah_number "
            "FROM pages WHERE page_number = ? ORDER BY line_number",
            (page_num,),
        )
        lines_rows = lc.fetchall()

        result_lines = []
        word_ids = []

        for row in lines_rows:
            first_word_id = row["first_word_id"]
            last_word_id = row["last_word_id"]

            line = {
                "line_number": row["line_number"],
                "line_type": row["line_type"],
                "is_centered": bool(row["is_centered"]),
                "surah_number": row["surah_number"],
                "first_word_id": first_word_id,
                "last_word_id": last_word_id,
            }

            if first_word_id and last_word_id:
                word_ids.append((int(first_word_id), int(last_word_id)))

            result_lines.append(line)

        words_map = {}
        if word_ids:
            conditions = []
            params = []
            for first, last in word_ids:
                conditions.append("(id >= ? AND id <= ?)")
                params.extend([first, last])

            where_clause = " OR ".join(conditions)
            wc.execute(
                f"SELECT id, text, surah, ayah, word FROM words WHERE {where_clause} ORDER BY id",
                params,
            )
            for w in wc.fetchall():
                words_map[w["id"]] = {
                    "word_index": w["id"],
                    "text": w["text"],
                    "surah": w["surah"],
                    "ayah": w["ayah"],
                    "position": w["word"],
                }

        for line in result_lines:
            fwid = line["first_word_id"]
            lwid = line["last_word_id"]
            if fwid and lwid:
                fwid = int(fwid)
                lwid = int(lwid)
                line["words"] = [
                    words_map[wid]
                    for wid in sorted(words_map.keys())
                    if fwid <= wid <= lwid
                ]
            else:
                line["words"] = []

        layout_conn.close()
        words_conn.close()

        return JsonResponse({
            "page": page_num,
            "total_pages": total_pages or None,
            "lines": result_lines,
        })

    except sqlite3.Error as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)