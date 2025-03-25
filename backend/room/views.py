from rest_framework import generics ,status , serializers
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny , IsAuthenticated
from rest_framework.response import Response
from .serializers import RoomSerializer
from room.models import Room 
# Create your views here.

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
