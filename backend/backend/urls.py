from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    

    # Accounts app (for registration, profiles)
    path('accounts/', include('accounts.urls')),
    path('room/', include('room.urls')),
    path('message/', include('chat.urls')),
    path('api/', include('uploadRoom.urls')),
]

# Add media URL patterns for development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
