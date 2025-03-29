from rest_framework import serializers
from uploadRoom.serializers import SongSerializer
from chat.serializers import MessageSerializer
from .models import Room ,RoomMember

class RoomSerializer(serializers.ModelSerializer):
    playlist = SongSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    members = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'code', 'host', 'members' , 'created_at', 'playlist', 'messages']
        
        extra_kwargs = {
        'host': {'read_only': True}
    }

class RoomMemberSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Shows username instead of ID
    room = serializers.StringRelatedField()  # Shows room name instead of ID

    class Meta:
        model = RoomMember
        fields = ['user', 'room', 'connected', 'joined_at']