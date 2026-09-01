import os

from django.core.management.base import BaseCommand, CommandError

from quotes.models import Author, Quote, Tag


class Command(BaseCommand):
    help = "Migrate authors and quotes from MongoDB to PostgreSQL"

    def add_arguments(self, parser):
        parser.add_argument(
            "--mongo-uri",
            default=os.getenv("MONGO_URI", "mongodb://localhost:27017/"),
            help="MongoDB connection URI",
        )
        parser.add_argument(
            "--mongo-db",
            default=os.getenv("MONGO_DB", "quotes"),
            help="MongoDB database name",
        )
        parser.add_argument(
            "--authors-collection",
            default=os.getenv("MONGO_AUTHORS_COLLECTION", "authors"),
            help="MongoDB authors collection name",
        )
        parser.add_argument(
            "--quotes-collection",
            default=os.getenv("MONGO_QUOTES_COLLECTION", "quotes"),
            help="MongoDB quotes collection name",
        )

    def handle(self, *args, **options):
        try:
            from pymongo import MongoClient
        except ImportError as exc:
            raise CommandError(
                "pymongo is required for MongoDB migration. "
                "Install it in your virtual environment first."
            ) from exc

        client = MongoClient(options["mongo_uri"])
        mongo_db = client[options["mongo_db"]]
        authors_collection = mongo_db[options["authors_collection"]]
        quotes_collection = mongo_db[options["quotes_collection"]]

        authors_by_mongo_id = {}
        authors_created = 0
        authors_updated = 0

        for item in authors_collection.find():
            fullname = item.get("fullname")
            if not fullname:
                continue

            author, created = Author.objects.update_or_create(
                fullname=fullname,
                defaults={
                    "born_date": item.get("born_date", ""),
                    "born_location": item.get("born_location", ""),
                    "description": item.get("description", ""),
                },
            )
            authors_by_mongo_id[str(item["_id"])] = author
            if created:
                authors_created += 1
            else:
                authors_updated += 1

        quotes_created = 0
        quotes_skipped = 0

        for item in quotes_collection.find():
            quote_text = item.get("quote")
            author = self._get_author(item.get("author"), authors_by_mongo_id)

            if not quote_text or author is None:
                quotes_skipped += 1
                continue

            quote, created = Quote.objects.get_or_create(
                author=author,
                quote=quote_text,
            )

            for tag_name in item.get("tags", []):
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                quote.tags.add(tag)

            if created:
                quotes_created += 1
            else:
                quotes_skipped += 1

        self.stdout.write(
            self.style.SUCCESS(
                "MongoDB migration completed: "
                f"authors created={authors_created}, "
                f"authors updated={authors_updated}, "
                f"quotes created={quotes_created}, "
                f"quotes skipped={quotes_skipped}"
            )
        )

    def _get_author(self, mongo_author, authors_by_mongo_id):
        if mongo_author is None:
            return None

        author = authors_by_mongo_id.get(str(mongo_author))
        if author is not None:
            return author

        if isinstance(mongo_author, str):
            return Author.objects.filter(fullname=mongo_author).first()

        return None
