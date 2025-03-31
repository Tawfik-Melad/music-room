from rest_framework import generics 
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny , IsAuthenticated
from .serializers import RegisterSerializer , UserProfileSerializer
# User Registration View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    def create(self, request, *args, **kwargs):
        print("DATA:", request.data)
        print("FILES:", request.FILES)
        return super().create(request, *args, **kwargs)



class UserProfileDetailView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]  # Only logged-in users can access

    def get_object(self):
        return self.request.user  # Get the user from the token