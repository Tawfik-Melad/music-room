from django.urls import path
from .views import MusicRoomView, SongView, SongDetailView

urlpatterns = [
    # Music Room endpoints
    path('music-rooms/<str:room_code>/', MusicRoomView.as_view(), name='music-room-detail'),
    
    # Song endpoints
    path('music-rooms/<str:room_code>/songs/', SongView.as_view(), name='song-list'),
    path('music-rooms/<str:room_code>/songs/<int:song_id>/', SongDetailView.as_view(), name='song-detail'),
]
