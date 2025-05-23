import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing 
import room.routing
import uploadRoom.routing
import customNotifications.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
application = get_asgi_application()

print("✅ ASGI file is running!")  # Test if this runs

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns +
            room.routing.websocket_urlpatterns +
            uploadRoom.routing.websocket_urlpatterns +
            customNotifications.routing.websocket_urlpatterns
        )
    ),
})
