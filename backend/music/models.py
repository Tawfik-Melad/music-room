from django.db import models
from django.contrib.auth.models import User
from room.models import Room

# Create your models here.
class Song(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='playlist')
    song_name = models.CharField(max_length=200)
    artist = models.CharField(max_length=100, blank=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    order = models.PositiveIntegerField()  # To maintain order in the queue

    def __str__(self):
        return f"{self.song_name} by {self.artist}"

