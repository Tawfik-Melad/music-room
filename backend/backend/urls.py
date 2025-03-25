from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    

    # Accounts app (for registration, profiles)
    path('accounts/', include('accounts.urls')),
    path('room/', include('room.urls')),
    path('message/', include('chat.urls')),
    path('music/', include('music.urls')),
]
