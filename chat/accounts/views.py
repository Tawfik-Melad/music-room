from rest_framework import generics ,status , serializers
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny , IsAuthenticated
from rest_framework.response import Response
from .serializers import RegisterSerializer , RoomSerializer , PlaylistSerializer , MessageSerializer
from .models import Room, Playlist

# User Registration View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    def create(self, request, *args, **kwargs):
        print("DATA:", request.data)
        print("FILES:", request.FILES)
        return super().create(request, *args, **kwargs)

# Create Room View
class CreateRoomView(generics.CreateAPIView):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        print("Host: ", self.request.user)
        serializer.save(host=self.request.user)

# Join Room View
class RetrieveRoomView(generics.GenericAPIView): 
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    def get(self, request, code):
        print("Code: ", code)
        if not code:
            return Response({'error': 'Room code is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            room = Room.objects.get(code=code)
            print(request.user)
            if request.user not in room.members.all():
                room.members.add(request.user)
                print(request.user.username, "joined room", room.code)
                room.save()
        except Room.DoesNotExist:
            return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

# Add Song to Room View
class AddSongView(generics.CreateAPIView):
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        room_id = self.request.data.get('room')
        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            raise serializers.ValidationError('Room does not exist.')

        serializer.save(room=room, added_by=self.request.user, order=room.playlist.count() + 1)

class CreateMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        room_code = self.request.data.get('room_code')
        if not room_code:
            raise serializers.ValidationError({"error": "room_id is required"})
        
        # Get the room instance
        try:
            room = Room.objects.get(code=room_code)
        except Room.DoesNotExist:
            raise serializers.ValidationError({"error": "Room does not exist"})

        # Save the message with user and room
        serializer.save(user=self.request.user, room=room)
