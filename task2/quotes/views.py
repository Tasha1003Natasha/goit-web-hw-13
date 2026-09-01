from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404, render, redirect
from .models import Quote, Author, Tag
from django.contrib.auth.decorators import login_required
from .forms import AuthorForm, QuoteForm


def main(request, page=1):
    quotes = Quote.objects.select_related(
        "author").prefetch_related("tags").all().order_by("-created_at")

    per_page = 10
    paginator = Paginator(quotes, per_page)
    quotes_on_page = paginator.get_page(page)

    return render(
        request,
        "quotes/index.html",
        {
            "quotes": quotes_on_page,
        }
    )


def author_detail(request, author_id):
    author = get_object_or_404(Author, id=author_id)
    return render(
        request,
        "quotes/author_detail.html",
        {
            "author": author,
        }
    )


def tag_detail(request, tag_name):
    tag = get_object_or_404(Tag, name=tag_name)

    quotes = Quote.objects.filter(tags=tag).select_related(
        "author").prefetch_related("tags")

    return render(
        request,
        "quotes/tag_detail.html",
        {
            "tag": tag,
            "quotes": quotes,
        }
    )


@login_required
def add_author(request):
    if request.method == 'POST':
        form = AuthorForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect(to='quotes:root')
        else:
            return render(request, 'quotes/author_form.html', {'form': form})

    return render(request, 'quotes/author_form.html', {'form': AuthorForm()})


@login_required
def add_quote(request):
    if request.method == 'POST':
        form = QuoteForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect(to='quotes:root')
        else:
            return render(request, 'quotes/quote_form.html', {'form': form})

    return render(request, 'quotes/quote_form.html', {'form': QuoteForm()})
