from django.urls import path
from .views import CreateRoomView, RetrieveRoomView, AddSongView , CreateMessageView

from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('create-room/', CreateRoomView.as_view(), name='create-room'),
    path('get-room/<str:code>/', RetrieveRoomView.as_view(), name='get-room'),
    path('add-song/', AddSongView.as_view(), name='add-song'),
    path('create-message/', CreateMessageView.as_view(), name='create-message'),
]
