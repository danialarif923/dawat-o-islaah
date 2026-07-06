from django.contrib import admin
from ckeditor.widgets import CKEditorWidget
from django import forms
from .models import Hadith


class HadithAdminForm(forms.ModelForm):

    arabic_text = forms.CharField(widget=CKEditorWidget(), required=False)
    english_text = forms.CharField(widget=CKEditorWidget(), required=False)

    class Meta:
        model = Hadith
        fields = "__all__"


@admin.register(Hadith)
class HadithAdmin(admin.ModelAdmin):

    form = HadithAdminForm

    list_display = (
        "book",
        "chapter_english",
        "chapter_arabic",
        "hadith_number",
        "created_at"
    )

    search_fields = (
        "book__name",
        "chapter_english",
        "chapter_arabic",
        "arabic_text",
        "english_text"
    )

    list_filter = ("book",)

    ordering = ("book__order", "hadith_number")  # 🔥 IMPORTANT

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("book").order_by(
            "book__order",
            "hadith_number"
        )