from django.urls import path
from .views import AddSongView


urlpatterns = [
    path('create/', AddSongView.as_view(), name='create-song'),
]
