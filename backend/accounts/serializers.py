from rest_framework import serializers
from django.contrib.auth.models import User
from django.conf import settings
# User Registration Serializer
from .models import Profile

# User Registration Serializer
class RegisterSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'profile_picture']
        extra_kwargs = {
            'password': {'write_only': True}
        }
        

    def create(self, validated_data):
        # Extract profile picture from validated data
        profile_picture = validated_data.pop('profile_picture', None)
        # Create user with hashed password
        user = User.objects.create_user(**validated_data)
        # Create profile with profile_picture if provided
        print("the profile photo",profile_picture)
        Profile.objects.create(user=user, profile_picture=profile_picture)
        return user
    
    

class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email","profile_picture"]

    def get_profile_picture(self, obj):
        if obj.profile.profile_picture:
            return self.context["request"].build_absolute_uri(obj.profile.profile_picture.url)
        return None
    
    

class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'profile_picture']

    def get_profile_picture(self, obj):
        profile = Profile.objects.filter(user=obj).first()
        return f"{settings.BASE_URL}{profile.profile_picture.url}"
