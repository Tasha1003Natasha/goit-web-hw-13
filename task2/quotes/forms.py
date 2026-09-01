from django.forms import ModelForm
from .models import Quote, Author


class AuthorForm(ModelForm):
    class Meta:
        model = Author
        fields = ['fullname', 'born_date', 'born_location', 'description']


class QuoteForm(ModelForm):
    class Meta:
        model = Quote
        fields = ['author', 'quote', 'tags']
