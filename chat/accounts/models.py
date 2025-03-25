from django.contrib.auth.models import User
from django.db import models
import random
import string


def generate_unique_code():
    """Generate a random 6-character alphanumeric code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    def __str__(self):
        return self.user.username

class Room(models.Model):
    code = models.CharField(max_length=8, unique=True, default=generate_unique_code)  # Unique 6-char code
    host = models.ForeignKey(User, on_delete=models.CASCADE)  # Who created the room
    name = models.CharField(max_length=50, blank=True, default="Room")  # Room name (default to "Room")
    current_song = models.CharField(max_length=200, blank=True, null=True)  # Current playing song
    created_at = models.DateTimeField(auto_now_add=True)
    is_playing = models.BooleanField(default=False)  
    members = models.ManyToManyField(User, related_name='joined_rooms', blank=True)

    def __str__(self):
        return f"Room {self.code} - Host: {self.host.username}"
    
class RoomMember(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    connected = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)
    
class Playlist(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='playlist')
    song_name = models.CharField(max_length=200)
    artist = models.CharField(max_length=100, blank=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    order = models.PositiveIntegerField()  # To maintain order in the queue

    def __str__(self):
        return f"{self.song_name} by {self.artist}"

class Message(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.content[:20]}"
