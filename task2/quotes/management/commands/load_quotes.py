import json
from pathlib import Path

from django.core.management.base import BaseCommand

from quotes.models import Author, Quote, Tag


class Command(BaseCommand):
    help = "Load authors and quotes from utils JSON files"

    def handle(self, *args, **options):
        authors_data = json.loads(Path("utils/authors.json").read_text())

        for item in authors_data:
            Author.objects.get_or_create(
                fullname=item["fullname"],
                defaults={
                    "born_date": item["born_date"],
                    "born_location": item["born_location"],
                    "description": item["description"],
                }
            )

        quotes_data = json.loads(Path("utils/qoutes.json").read_text())

        for item in quotes_data:
            author = Author.objects.get(fullname=item["author"])

            quote = Quote.objects.create(
                author=author,
                quote=item["quote"]
            )

            for tag_name in item["tags"]:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                quote.tags.add(tag)

        self.stdout.write(self.style.SUCCESS("Authors and quotes loaded successfully"))
