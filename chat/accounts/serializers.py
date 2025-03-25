from rest_framework import serializers
from django.contrib.auth.models import User

# User Registration Serializer
from .models import Profile, Room, Playlist, Message

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
    
    
class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = ['id', 'song_name', 'artist', 'added_by', 'order']
                
        extra_kwargs = {
        'order': {'read_only': True}
        }

class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message
        fields = ['id','room', 'user', 'content', 'timestamp']
        read_only_fields = ['user', 'room']

class RoomSerializer(serializers.ModelSerializer):
    playlist = PlaylistSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    members = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'code', 'host', 'members' ,'current_song', 'created_at', 'is_playing', 'playlist', 'messages']
        
        extra_kwargs = {
        'host': {'read_only': True}
    }
