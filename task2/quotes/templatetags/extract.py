from django import template
from quotes.models import Author

register = template.Library()


def author(author_id):
    author_obj = Author.objects.get(id=author_id)
    return author_obj.fullname


register.filter("author", author)
