from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import MusicRoom, Room, Song, SongInfo
from .serializers import MusicRoomSerializer, SongSerializer, SongInfoSerializer
from django.shortcuts import get_object_or_404
import json
from django.conf import settings
class MusicRoomView(APIView):

    def get(self, request, room_code):
        try:
            room = Room.objects.get(code=room_code)
            music_room, created = MusicRoom.objects.get_or_create(room=room)
            serializer = MusicRoomSerializer(music_room)
            return Response(serializer.data)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, room_code):
        try:
            room = Room.objects.get(code=room_code)
            music_room, created = MusicRoom.objects.get_or_create(room=room)
            serializer = MusicRoomSerializer(music_room)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, room_code):
        try:
            room = Room.objects.get(code=room_code)
            music_room = MusicRoom.objects.get(room=room)
            serializer = MusicRoomSerializer(music_room, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
        except MusicRoom.DoesNotExist:
            return Response({"error": "Music room not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, room_code):
        try:
            room = Room.objects.get(code=room_code)
            music_room = MusicRoom.objects.get(room=room)
            music_room.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
        except MusicRoom.DoesNotExist:
            return Response({"error": "Music room not found"}, status=status.HTTP_404_NOT_FOUND)

class SongView(APIView):

    def get(self, request, room_code):
        try:
            room = Room.objects.get(code=room_code)
            music_room = MusicRoom.objects.get(room=room)
            songs = Song.objects.filter(room=music_room)
            serializer = SongSerializer(songs, many=True, context={'request': request})
            return Response(serializer.data)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
        except MusicRoom.DoesNotExist:
            return Response({"error": "Music room not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, room_code):
        try:
            room = Room.objects.get(code=room_code)
            music_room = MusicRoom.objects.get(room=room)
            
            # Handle file upload
            file_obj = request.FILES.get('file')
            if not file_obj:
                return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

            # Create song
            song = Song.objects.create(
                file=file_obj,
                uploaded_by=request.user,
                room=music_room
            )

            # Handle song info if provided
            info_data = request.data.get('info')
            if info_data:
                try:
                    info_data = json.loads(info_data) if isinstance(info_data, str) else info_data
                    SongInfo.objects.create(
                        song=song,
                        title=info_data.get('title', ''),
                        artist=info_data.get('artist', ''),
                        cover_picture= request.build_absolute_uri('/media/song-covers/defult.png')
                    )
                except json.JSONDecodeError:
                    return Response({"error": "Invalid info format"}, status=status.HTTP_400_BAD_REQUEST)

            serializer = SongSerializer(song, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
        except MusicRoom.DoesNotExist:
            return Response({"error": "Music room not found"}, status=status.HTTP_404_NOT_FOUND)

class SongDetailView(APIView):

    def get(self, request, room_code, song_id):
        try:
            room = Room.objects.get(code=room_code)
            music_room = MusicRoom.objects.get(room=room)
            song = Song.objects.get(id=song_id, room=music_room)
            serializer = SongSerializer(song, context={'request': request})
            return Response(serializer.data)
        except (Room.DoesNotExist, MusicRoom.DoesNotExist, Song.DoesNotExist):
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, room_code, song_id):
        try:
            room = Room.objects.get(code=room_code)
            music_room = MusicRoom.objects.get(room=room)
            song = Song.objects.get(id=song_id, room=music_room)
            
            # Update song position if provided
            if 'song_position' in request.data:
                song.song_position = request.data['song_position']
                song.save()

            # Update song info if provided
            info_data = request.data.get('info')
            if info_data:
                info, created = SongInfo.objects.get_or_create(song=song)
                info_serializer = SongInfoSerializer(info, data=info_data, partial=True)
                if info_serializer.is_valid():
                    info_serializer.save()

            serializer = SongSerializer(song, context={'request': request})
            return Response(serializer.data)
        except (Room.DoesNotExist, MusicRoom.DoesNotExist, Song.DoesNotExist):
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, room_code, song_id):
        try:
            room = Room.objects.get(code=room_code)
            music_room = MusicRoom.objects.get(room=room)
            song = Song.objects.get(id=song_id, room=music_room)
            song.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except (Room.DoesNotExist, MusicRoom.DoesNotExist, Song.DoesNotExist):
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)