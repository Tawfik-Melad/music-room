from django.urls import re_path

from . import consumers  # Import your consumer class
websocket_urlpatterns = [
    re_path(r'ws/room/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
]