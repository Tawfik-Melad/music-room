from django.urls import path
from .views import CreateRoomView, RetrieveRoomView


urlpatterns = [
    path('create/', CreateRoomView.as_view(), name='create-room'),
    path('get/<str:code>/', RetrieveRoomView.as_view(), name='get-room'),
    
]
