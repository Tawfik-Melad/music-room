from django.db import models
from django.contrib.auth.models import User

import random
import string


def generate_unique_code():
    """Generate a random 6-character alphanumeric code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


# Create your models here.
class Room(models.Model):
    code = models.CharField(max_length=8, unique=True, default=generate_unique_code)  # Unique 6-char code
    host = models.ForeignKey(User, on_delete=models.CASCADE)  # Who created the room
    name = models.CharField(max_length=50, blank=True, default="Room")  # Room name (default to "Room")
    created_at = models.DateTimeField(auto_now_add=True)
    members = models.ManyToManyField(User, related_name='joined_rooms', blank=True)

    def __str__(self):
        return f"Room {self.code} - Host: {self.host.username}"
    
class RoomMember(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    connected = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} in {self.room.code}"
