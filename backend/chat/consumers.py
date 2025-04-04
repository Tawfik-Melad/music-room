import os
import django

# Point to your project's settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract room name from URL
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"
        
        query_string = self.scope['query_string'].decode()
        user_id = query_string.split("user_id=")[-1]
        
        try:
            self.user = await self.get_user(user_id)
        except User.DoesNotExist:
            await self.close()
            return
        
        # Add user to the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name  # Unique to this socket connection
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Remove user from the group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Handle incoming messages
        data = json.loads(text_data)
        message = data['message']
        
        # Broadcast message to the group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',  # Calls chat_message function
                'message': message
            }
        )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))
        
    async def get_user(self, user_id):
        return await User.objects.aget(id=user_id)
