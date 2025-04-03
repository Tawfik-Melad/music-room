from django.urls import path
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),

    # Custom JWT Views
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('get-user/', views.UserProfileDetailView.as_view(), name='get_user'),
    path('update-profile-picture/', views.UpdateProfilePictureView.as_view(), name='update_profile_picture'),
    
]
