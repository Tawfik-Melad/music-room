from rest_framework import generics 
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny , IsAuthenticated
from .serializers import RegisterSerializer 

# User Registration View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    def create(self, request, *args, **kwargs):
        print("DATA:", request.data)
        print("FILES:", request.FILES)
        return super().create(request, *args, **kwargs)



