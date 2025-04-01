import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer


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

    async def song_update(self, event):
        # Send song update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'song_update',
            'song': event['song']
        }))
