import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import accounts.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat.settings')

print("✅ ASGI file is running!")  # Test if this runs

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            accounts.routing.websocket_urlpatterns
        )
    ),
})
