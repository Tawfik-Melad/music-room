from rest_framework import generics , serializers
from rest_framework.permissions import  IsAuthenticated
from .serializers import MessageSerializer
from room.models import Room 

# Create your views here.
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
