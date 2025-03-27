from django.urls import re_path

from . import consumers  # Import your consumer class
websocket_urlpatterns = [
    re_path(r'ws/status/(?P<room_code>\w+)/$', consumers.UserStatusConsumer.as_asgi()),
]