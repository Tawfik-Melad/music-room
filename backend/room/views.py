from rest_framework import generics ,status , serializers
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny , IsAuthenticated
from rest_framework.response import Response
from .serializers import RoomSerializer , RoomMemberSerializer
from django.shortcuts import get_object_or_404
from room.models import Room , RoomMember

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import Http404
from .models import RoomMember
from .serializers import RoomMemberSerializer

# Create your views here.

# Create Room View
class CreateRoomView(generics.CreateAPIView):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        serializer.save(host=self.request.user)

# Join Room View
class RetrieveRoomView(generics.GenericAPIView): 
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    def get(self, request, code):
        if not code:
            return Response({'error': 'Room code is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            room = Room.objects.get(code=code)
            if request.user not in room.members.all():
                room.members.add(request.user)
                room.save()
        except Room.DoesNotExist:
            return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)



class RoomMemberStatusView(generics.RetrieveAPIView):
    serializer_class = RoomMemberSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Get parameters from URL
        room_code = self.kwargs.get('room_code')
        username = self.kwargs.get('username')
        
        try:
            # Retrieve the RoomMember object
            room_member = RoomMember.objects.get(
                room__code=room_code,
                user__username=username
            )
            # Serialize the object
            serializer = RoomMemberSerializer(room_member)
            # Return serialized data
            return Response(serializer.data)
        except RoomMember.DoesNotExist:
            # Return 404 if object not found
            raise Http404("RoomMember not found.")
