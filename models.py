from django.db import models
from django.conf import settings
from ckeditor.fields import RichTextField


class SyncStatus(models.Model):
    name = models.CharField(max_length=100, unique=True)
    last_page = models.IntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
class Book(models.Model):
    name = models.CharField(max_length=150, unique=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name

class Hadith(models.Model):

    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name="hadiths"
    )

    chapter_english = models.CharField(max_length=255)
    chapter_arabic = models.CharField(max_length=255, blank=True, null=True)

    hadith_number = models.IntegerField()

    arabic_text = RichTextField(config_name="default", blank=True, null=True)
    urdu_text = RichTextField(config_name="default", blank=True, null=True)
    english_text = RichTextField(config_name="default", blank=True, null=True)

    reference = models.CharField(max_length=255, blank=True, null=True)

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["book", "hadith_number"],
                name="unique_hadith_per_book"
            )
        ]

        ordering = ['book__order', 'hadith_number']

    def __str__(self):
        return f"{self.book.name} | {self.hadith_number}"
