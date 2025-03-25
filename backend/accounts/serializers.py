from rest_framework import serializers
from django.contrib.auth.models import User

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
    
    

