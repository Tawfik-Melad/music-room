from rest_framework import generics 
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny , IsAuthenticated
from .serializers import RegisterSerializer , UserProfileSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import os

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

    def validate_image(self, image):
        # Check file size (max 5MB)
        if image.size > 5 * 1024 * 1024:
            raise ValueError("Image file too large ( > 5MB )")
        
        # Check file extension
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
        ext = os.path.splitext(image.name)[1].lower()
        if ext not in valid_extensions:
            raise ValueError("Unsupported file extension. Please use: .jpg, .jpeg, .png, or .gif")
        
        return True

    def post(self, request, *args, **kwargs):
        try:
            profile = request.user.profile
            if 'profile_picture' in request.FILES:
                image = request.FILES['profile_picture']
                
                # Validate the image
                try:
                    self.validate_image(image)
                except ValueError as e:
                    return Response({
                        'status': 'error',
                        'message': str(e)
                    }, status=400)
                
                # Delete old profile picture if it exists and it's not the default
                if profile.profile_picture and 'default.jpg' not in profile.profile_picture.name:
                    try:
                        old_image_path = profile.profile_picture.path
                        if os.path.exists(old_image_path):
                            os.remove(old_image_path)
                    except Exception:
                        pass  # If deletion fails, continue anyway
                
                # Save new profile picture
                profile.profile_picture = image
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