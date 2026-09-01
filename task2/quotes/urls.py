from django.urls import path
from . import views


app_name = "quotes"

urlpatterns = [
    path('', views.main, name='root'),
    path("page/<int:page>/", views.main, name="page"),
    path("author/<int:author_id>/", views.author_detail, name="author_detail"),
    path("tag/<str:tag_name>/", views.tag_detail, name="tag_detail"),
    path('author/', views.add_author, name='author'),
    path('quote/', views.add_quote, name='quote'),
]
