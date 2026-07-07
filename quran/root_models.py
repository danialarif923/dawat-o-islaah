from django.db import models


class WordRoot(models.Model):
    surah = models.IntegerField(db_index=True)
    ayah = models.IntegerField(db_index=True)
    word_index = models.IntegerField()
    root_arabic = models.CharField(max_length=50, db_index=True)
    lemma_arabic = models.CharField(max_length=100, blank=True, default="")

    class Meta:
        unique_together = ("surah", "ayah", "word_index")
        indexes = [
            models.Index(fields=["root_arabic"]),
            models.Index(fields=["lemma_arabic"]),
        ]

    def __str__(self):
        return f"{self.surah}:{self.ayah}:{self.word_index} → {self.root_arabic}"
