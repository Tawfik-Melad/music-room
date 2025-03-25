from django.urls import path
from .views import CreateMessageView


urlpatterns = [
    path('create/', CreateMessageView.as_view(), name='create-message'),
]
