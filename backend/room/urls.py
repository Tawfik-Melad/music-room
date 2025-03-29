from django.urls import path
from .views import CreateRoomView, RetrieveRoomView , RoomMemberStatusView


urlpatterns = [
    path('create/', CreateRoomView.as_view(), name='create-room'),
    path('get/<str:code>/', RetrieveRoomView.as_view(), name='get-room'),
    path('get/<str:code>/', RetrieveRoomView.as_view(), name='get-room'),
    path('status/<str:room_code>/members/<str:username>/', RoomMemberStatusView.as_view(), name='room-member-status'),
    
]
