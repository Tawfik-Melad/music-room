import os
import django
from django.conf import settings
import asyncio
from channels.layers import get_channel_layer
    
# Point to your project's settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from room.models import RoomMember, Room

# Dictionary to store room deletion tasks
room_deletion_tasks = {}

class UserStatusConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        try:
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
                print(f"⚠️ Connection rejected: User or room not found")
                await self.close(code=4004)
                return

            # Accept the connection first
            await self.accept()
            
            # Add user to room members if not already a member
            is_member = await self.add_user_to_room_members()
            if not is_member:
                print(f"⚠️ Failed to add user {self.user.username} to room members")
                await self.close(code=4005)
                return

            # Set user as connected
            await self.set_user_status(True)
            print(f"🟢 User {self.user.username} connected to room {self.room.code}")

            # Add user to the room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            # Get profile picture URL safely
            self.profile_picture = await self.get_profile_picture()

            # Send initial status to the connecting user
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Successfully connected to room',
                'room_code': self.room.code,
                'user': self.user.username,
                'status': 'online',
                'profile_picture': self.profile_picture
            }))

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
            
        except Exception as e:
            print(f"⚠️ Error in WebSocket connection: {str(e)}")
            await self.close(code=4000)
            return

    async def disconnect(self, close_code):
        try:
            if hasattr(self, 'user'):
                # Set user as disconnected
                await self.set_user_status(False)
                print(f"🔴 User {self.user.username} disconnected from room {self.room.code} (code: {close_code})")
                
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

                # Check if this was the last user in the room
                is_last_user = await self.is_last_user_in_room()
                print(is_last_user)
                if is_last_user:
                    # Cancel any existing deletion task for this room
                    if self.room_code in room_deletion_tasks:
                        room_deletion_tasks[self.room_code].cancel()
                    
                    # Create a new deletion task
                    room_deletion_tasks[self.room_code] = asyncio.create_task(
                        self.delete_room_after_delay()
                    )
        except Exception as e:
            print(f"⚠️ Error in WebSocket disconnection: {str(e)}")

    @database_sync_to_async
    def is_last_user_in_room(self):
        """Check if the current user is the last connected user in the room"""
        connected_users = RoomMember.objects.filter(
            room=self.room,
            connected=True
        ).count()
        return connected_users == 0 

    async def delete_room_after_delay(self):
        """Delete the room after a 3-second delay if no one reconnects"""
        try:
            await asyncio.sleep(6)  # Wait for 3 seconds
            
            # Check again if there are still no connected users
            is_still_empty = await self.is_last_user_in_room()
            if is_still_empty:
                # Delete the room
                await self.delete_room()
                print(f"🗑️ Room {self.room.code} deleted due to no users")
        except asyncio.CancelledError:
            # Task was cancelled (someone reconnected)
            print(f"✅ Room {self.room.code} deletion cancelled - user reconnected")
        except Exception as e:
            print(f"⚠️ Error in room deletion: {str(e)}")
        finally:
            # Clean up the task from the dictionary
            if self.room_code in room_deletion_tasks:
                del room_deletion_tasks[self.room_code]

    @database_sync_to_async
    def delete_room(self):
        """Delete the room and all related data from the database"""
        try:
            # Get the music room and all related songs
            music_room = self.room.music_room
            if music_room:
                # Get all songs in the music room
                songs = music_room.songs.all()
                
                # Delete each song (this will also delete the files and song info)
                for song in songs:
                    song.delete()
                
                # Delete the music room
                music_room.delete()
            
            # Finally delete the room itself
            self.room.delete()
            print(f"🗑️ Room {self.room.code} and all related data deleted")
            return True
        except Exception as e:
            print(f"⚠️ Error deleting room and related data: {str(e)}")
            return False

    async def user_status(self, event):
        # Send user status to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user': event['user'],
            'status': event['status'],
            'profile_picture': event['profile_picture']
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
                self.room.members.add(self.user)
                self.room.save()
                print(f"✅ Added user {self.user.username} to room {self.room.code}")
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
