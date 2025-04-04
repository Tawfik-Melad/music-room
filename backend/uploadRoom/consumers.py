import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Song, MusicRoom


class UploadRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get room_id from the URL
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'room_{self.room_id}'
        
        # Get user_id from query string
        query_string = self.scope['query_string'].decode()
        user_id = None
        if 'user_id=' in query_string:
            user_id = query_string.split('user_id=')[-1].split('&')[0]
        
        if not user_id:
            await self.close()
            return

        # Get user and room asynchronously
        self.user = await self.get_user(user_id)
        if not self.user:
            await self.close()
            return

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        try:
            if self.user.is_authenticated and self.room_id:
                # Get all songs in the room
                songs = await self.get_room_songs()
                
                # Remove user from all songs' listening lists
                for song in songs:
                    if self.user.username in song.listening_users:
                        song.listening_users.remove(self.user.username)
                        await self.save_song(song)
                        
                        # Notify other users about the update
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'listening_update',
                                'song_id': song.id,
                                'listening_users': song.listening_users
                            }
                        )
        except Exception as e:
            print(f"Error in disconnect: {str(e)}")
        finally:
            # Always leave the room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        # Handle incoming messages
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'new_song':
            # Broadcast the new song only to users in this specific room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'song_update',
                    'song': data.get('song')
                }
            )
        elif message_type == 'toggle_like':
            # Handle like/unlike
            song_id = data.get('song_id')
            user_id = data.get('user_id')
            
            # Get the updated likes count, action, and liked usernames
            likes_count, action, liked_usernames = await self.toggle_like(song_id, user_id)
            
            # Broadcast the like update to all users in the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'like_update',
                    'song_id': song_id,
                    'likes_count': likes_count,
                    'action': action,
                    'user_id': user_id,
                    'username': data.get('username'),
                    'liked_usernames': liked_usernames
                }
            )
        elif message_type == 'listening_update':
            song_id = data.get('song_id')
            username = data.get('username')
            is_listening = data.get('is_listening')
            
            try:
                song = await self.get_song(song_id)
                if song:
                    listening_users = song.listening_users or []
                    if is_listening:
                        if username not in listening_users:
                            listening_users.append(username)
                    else:
                        if username in listening_users:
                            listening_users.remove(username)
                    
                    song.listening_users = listening_users
                    await self.save_song(song)
                    
                    # Broadcast the update to all connected clients
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'listening_update',
                            'song_id': song_id,
                            'listening_users': listening_users
                        }
                    )
            except Exception as e:
                print(f"Error handling listening update: {str(e)}")
        elif message_type == 'delete_song':
            # Handle song deletion
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'song_deleted',
                    'song_id': data['song_id']
                }
            )

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None


    @database_sync_to_async
    def toggle_like(self, song_id, user_id):
        try:
            song = Song.objects.get(id=song_id)
            user = User.objects.get(id=user_id)
            if user in song.liked_by.all():
                song.liked_by.remove(user)
                action = 'unliked'
            else:
                song.liked_by.add(user)
                action = 'liked'
            
            # Get list of usernames who liked the song
            liked_usernames = list(song.liked_by.values_list('username', flat=True))
            return song.likes_count, action, liked_usernames
        except (Song.DoesNotExist, User.DoesNotExist):
            return 0, 'error', []

    @database_sync_to_async
    def get_song(self, song_id):
        try:
            return Song.objects.get(id=song_id)
        except Song.DoesNotExist:
            return None

    @database_sync_to_async
    def get_room_songs(self):
        try:
            if not self.room_id:
                return []
                
            # Get the room by room_id
            room = MusicRoom.objects.get(id=self.room_id)
            return list(room.songs.all())
        except MusicRoom.DoesNotExist:
            return []
        except Exception as e:
            print(f"Error getting room songs: {str(e)}")
            return []

    @database_sync_to_async
    def save_song(self, song):
        song.save()

    async def song_update(self, event):
        # Send song update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'song_update',
            'song': event['song'],
        }))

    async def like_update(self, event):
        # Send like update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'like_update',
            'song_id': event['song_id'],
            'likes_count': event['likes_count'],
            'action': event['action'],
            'user_id': event['user_id'],
            'username': event['username'],
            'liked_usernames': event['liked_usernames']
        }))

    async def listening_update(self, event):
        # Send listening update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'listening_update',
            'song_id': event['song_id'],
            'listening_users': event['listening_users']
        }))

    async def song_deleted(self, event):
        # Send song deletion event to all clients
        await self.send(text_data=json.dumps({
            'type': 'song_deleted',
            'song_id': event['song_id']
        }))
        
