import os
import django
from django.conf import settings
    
# Point to your project's settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from room.models import RoomMember, Room


class UserStatusConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # Extract room and user information
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f"presence_{self.room_code}"
        
        # Extract user ID from query string
        query_string = self.scope['query_string'].decode()
        self.user_id = query_string.split("user_id=")[-1]
        
        # Get user and room asynchronously
        self.user = await self.get_user(self.user_id)
        self.room = await self.get_room(self.room_code)

        # Ensure user and room exist
        if not self.user or not self.room:
            await self.close()
            return
        
        print(f"🔗 Connected as ->: {self.user.username}")

        # Set user as connected and add to room members
        await self.set_user_status(True)
        await self.add_user_to_room_members()

        # Add user to the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Get profile picture URL safely
        self.profile_picture = await self.get_profile_picture()
        print("profile_picture -------------- >", self.profile_picture)

        # Notify others that the user is online
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status',
                'user': self.user.username,
                'status': 'online',
                'profile_picture': self.profile_picture
            }
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'user'):
            print(f"🔗 Disconnected as: {self.user.username}")
            # Set user as disconnected
            await self.set_user_status(False)
            
            # Get profile picture URL safely
            # Remove user from the room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            
            # Notify others that the user is offline
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status',
                    'user': self.user.username,
                    'status': 'offline',
                    'profile_picture': self.profile_picture
                }
            )

    async def user_status(self, event):
        # Send user status to WebSocket
        await self.send(text_data=json.dumps({
            'user': event['user'],
            'status': event['status'],
            'profile_picture': event['profile_picture'],
            'type': 'user_status'
        }))

    @database_sync_to_async
    def get_profile_picture(self):
        if hasattr(self.user, 'profile') and self.user.profile.profile_picture:
            # Get the relative URL
            relative_url = self.user.profile.profile_picture.url
            # Construct the complete URL
            return f"{settings.BASE_URL}{relative_url}"
        return None

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def get_room(self, room_code):
        try:
            return Room.objects.get(code=room_code)
        except Room.DoesNotExist:
            return None
    
    @database_sync_to_async
    def add_user_to_room_members(self):
        try:
            # Check if user is already a member
            if not self.room.members.filter(id=self.user.id).exists():
                print(f"➕ Adding {self.user.username} to room {self.room.code}")
                self.room.members.add(self.user)
                self.room.save()
            else:
                print(f"✅ {self.user.username} is already a member of room {self.room.code}")
            return True
        except Exception as e:
            print(f"⚠️ Error adding user to room: {str(e)}")
            return False
        
    @database_sync_to_async
    def set_user_status(self, connected):
        try:
            RoomMember.objects.update_or_create(
                user=self.user,
                room=self.room,
                defaults={'connected': connected}
            )
            return True
        except Exception as e:
            print(f"⚠️ Error setting user status: {str(e)}")
            return False
