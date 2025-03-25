from rest_framework import generics ,status , serializers
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny , IsAuthenticated
from rest_framework.response import Response
from .serializers import SongSerializer 
from room.models import Room
# Create your views here.
# Add Song to Room View
class AddSongView(generics.CreateAPIView):
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        room_id = self.request.data.get('room')
        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            raise serializers.ValidationError('Room does not exist.')

        serializer.save(room=room, added_by=self.request.user, order=room.playlist.count() + 1)
