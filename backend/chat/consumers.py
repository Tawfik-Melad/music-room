import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract room name from URL
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"

        # Add user to the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name  # Unique to this socket connection
        )

        await self.accept()
        print(f"✅ Connected to room: {self.room_name}")

    async def disconnect(self, close_code):
        # Remove user from the group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"❌ Disconnected from room: {self.room_name}")

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
