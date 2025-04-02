import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get room_id from URL
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'notifications_{self.room_id}'

        # Join room-specific notification group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room-specific notification group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        username = text_data_json['username']
        action = text_data_json['action']

        # Send message to room-specific notification group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'notification_message',
                'message': message,
                'username': username,
                'action': action
            }
        )

    async def notification_message(self, event):
        message = event['message']
        username = event['username']    
        action = event['action']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'username': username,
            'action': action
        })) 