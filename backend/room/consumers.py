import os
import django

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
        self.user = await self.get_user(self.user_id)

        # Ensure user exists
        if not self.user:
            await self.close()
            return
        
        print(f"🔗 Connected as ->: {self.user.username}")

        # Set user as connected
        await self.set_user_status(connected=True)
        await self.add_user_to_room_members(self.room_code, self.user_id)

        # Add user to the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Notify others that the user is online
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status',
                'user': self.user.username,
                'status': 'online'
            }
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        # Set user as disconnected
        print(f"🔗 Disconnected as: {self.user.username}")
        await self.set_user_status(connected=False)
        
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
                'status': 'offline'
            }
        )

    async def user_status(self, event):
        # Send user status to WebSocket
        await self.send(text_data=json.dumps({
            'user': event['user'],
            'status': event['status'],
            'type': 'user_status'
        }))

    # Get the user asynchronously
    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    # Add user to room
    @database_sync_to_async
    def get_room(self, room_code):
        try:
            return Room.objects.get(code=room_code)
        except Room.DoesNotExist:
            return None
    
    @database_sync_to_async
    def add_user_to_room_members(self, room_code, user_id):
        try:
            # Get the room and user objects
            room = Room.objects.get(code=room_code)
            user = User.objects.get(id=user_id)

            # Check if user is already a member
            if not room.members.filter(id=user_id).exists():
                print(f"➕ Adding {user.username} to room {room.code}")
                room.members.add(user)  # Add user to ManyToMany field
                room.save()
            else:
                print(f"✅ {user.username} is already a member of room {room.code}")

            return room  # Return room object if needed

        except Room.DoesNotExist:
            print(f"⚠️ Room with code {room_code} does not exist.")
            return None
        except User.DoesNotExist:
            print(f"⚠️ User with ID {user_id} does not exist.")
            return None

        
    
    # Create or update RoomMember's status
    @database_sync_to_async
    def set_user_status(self, connected):
        try:
            print(f"Room code: {self.room_code}")
            print(f"User ID: {self.user_id}")
            print(f"Connected: {connected}")
            if not connected:
                print(f"🔗 Disconnected as: {self.user.username}")
            room = Room.objects.get(code=self.room_code)
            RoomMember.objects.update_or_create(
                user=self.user,
                room=room,
                defaults={'connected': connected}
            )
        except Room.DoesNotExist:
            print(f"⚠️ Room with code {self.room_code} does not exist.")
