from rest_framework import serializers
from .models import MusicRoom, Song, SongInfo
from django.contrib.auth.models import User

class SongInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongInfo
        fields = ['id', 'title', 'artist', 'cover_picture']
        read_only_fields = ['id']

class SongSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.StringRelatedField()
    info = SongInfoSerializer(required=False)
    full_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Song
        fields = ['id', 'file', 'uploaded_by', 'uploaded_at', 'song_position', 'order', 'info', 'full_url']
        read_only_fields = ['uploaded_by', 'uploaded_at', 'order']

    def get_full_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None

class MusicRoomSerializer(serializers.ModelSerializer):
    songs = SongSerializer(many=True, read_only=True)
    
    class Meta:
        model = MusicRoom
        fields = [
            'id',
            'is_playing',
            'volume',
            'created_at',
            'songs'
        ]
        read_only_fields = ['created_at']