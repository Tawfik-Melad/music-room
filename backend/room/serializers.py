from rest_framework import serializers
from music.serializers import SongSerializer
from chat.serializers import MessageSerializer
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    playlist = SongSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    members = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'code', 'host', 'members' ,'current_song', 'created_at', 'is_playing', 'playlist', 'messages']
        
        extra_kwargs = {
        'host': {'read_only': True}
    }
