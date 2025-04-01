import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Song


class UploadRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get room_id from the URL
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'room_{self.room_id}'

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Handle incoming messages
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')
        
        if message_type == 'new_song':
            # Broadcast the new song only to users in this specific room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'song_update',
                    'song': text_data_json.get('song')
                }
            )
        elif message_type == 'toggle_like':
            # Handle like/unlike
            song_id = text_data_json.get('song_id')
            user_id = text_data_json.get('user_id')
            
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
                    'username': text_data_json.get('username'),
                    'liked_usernames': liked_usernames
                }
            )

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

    async def song_update(self, event):
        # Send song update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'song_update',
            'song': event['song']
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
