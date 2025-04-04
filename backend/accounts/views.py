from rest_framework import generics 
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny , IsAuthenticated
from .serializers import RegisterSerializer , UserProfileSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings

# User Registration View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class UserProfileDetailView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]  # Only logged-in users can access

    def get_object(self):
        return self.request.user  # Get the user from the token

class UpdateProfilePictureView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        try:
            profile = request.user.profile
            if 'profile_picture' in request.FILES:
                profile.profile_picture = request.FILES['profile_picture']
                profile.save()
                
                # Get the full URL for the profile picture
                profile_picture_url = request.build_absolute_uri(profile.profile_picture.url)
                
                return Response({
                    'status': 'success',
                    'message': 'Profile picture updated successfully',
                    'profile_picture': profile_picture_url
                })
            else:
                return Response({
                    'status': 'error',
                    'message': 'No profile picture provided'
                }, status=400)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=500)