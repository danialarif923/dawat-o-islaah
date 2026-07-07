import re
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from quran.models import Ayat
from quran.root_models import WordRoot

DIACRITICS_RE = re.compile(r"[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A\u0671]")


def _normalize(text):
    text = DIACRITICS_RE.sub("", text)
    text = text.replace("\u0625", "\u0627")  # إ → ا
    text = text.replace("\u0623", "\u0627")  # أ → ا
    text = text.replace("\u0622", "\u0627")  # آ → ا
    text = text.replace("\u0671", "\u0627")  # ٱ → ا
    text = text.replace("\u0647\u0647", "\u0647")  # هه → ه
    text = text.replace("\u0629", "\u0647")  # ة → ه
    text = text.replace("\u0649", "\u064a")  # ى → ي
    text = text.replace("\u064A\u0653", "\u064A")  # يٓ → ي
    text = text.replace("\u0643", "\u0643")  # ك stays ك
    text = text.replace("\u06CC", "\u064A")  # ی → ي
    text = text.replace("\u06D2", "\u064A")  # ے → ي
    text = text.replace("\u0621", "")  # remove standalone hamza
    text = text.replace("\u0626", "\u064A")  # ئ → ي
    text = text.replace("\u0624", "\u0648")  # ؤ → و
    text = text.replace("\u0654", "")  # hamza above
    text = text.replace("\u0655", "")  # hamza below
    text = text.replace("\u0640", "")  # tatweel
    return text.strip()


@api_view(["GET"])
def search_by_root(request):
    q = request.GET.get("q", "").strip()
    surah_filter = request.GET.get("surah")

    if not q:
        return Response({"results": []})

    q_norm = _normalize(q)

    word_roots = WordRoot.objects.all()

    filter_q = Q(root_arabic__contains=q_norm)

    if q_norm != q:
        filter_q |= Q(root_arabic__contains=_normalize(q))

    filter_q |= Q(lemma_arabic__icontains=q_norm)

    if q != q_norm:
        filter_q |= Q(lemma_arabic__icontains=q)
        filter_q |= Q(root_arabic__contains=q)

    word_roots = word_roots.filter(filter_q)

    if surah_filter:
        try:
            word_roots = word_roots.filter(surah=int(surah_filter))
        except ValueError:
            pass

    ayah_pairs = list(
        word_roots.values_list("surah", "ayah")
        .distinct()
        .order_by("surah", "ayah")
    )

    results = []
    for surah, ayah in ayah_pairs:
        try:
            ayat = Ayat.objects.get(surah=surah, ayat_number=ayah)
            raw_text = ayat.text or ""
            text = re.sub(r"<[^>]+>", "", raw_text).strip()
            results.append({
                "surah": {"number": surah},
                "numberInSurah": ayah,
                "ar": text,
            })
        except Ayat.DoesNotExist:
            continue

    return Response({"results": results})
