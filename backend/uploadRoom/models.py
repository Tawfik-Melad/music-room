from django.db import models
from room.models import Room
from django.contrib.auth.models import User
from django.utils import timezone
import os

class MusicRoom(models.Model):
    room = models.OneToOneField(Room, on_delete=models.CASCADE, related_name='music_room')
    is_playing = models.BooleanField(default=False)
    volume = models.FloatField(default=1.0)  # Volume level (0.0 to 1.0)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Music Room for {self.room.name}"



class Song(models.Model):
    file = models.FileField(upload_to='local-songs/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    song_position = models.FloatField(default=0)  # Current position in seconds
    room = models.ForeignKey(MusicRoom, on_delete=models.CASCADE, related_name='songs')
    order = models.PositiveIntegerField(default=0)
    liked_by = models.ManyToManyField(User, related_name='liked_songs', blank=True)
    listening_users = models.JSONField(default=list)  # Track who is listening to each song

    def __str__(self):
        return f"{self.file.name} - {self.uploaded_by.username}"

    @property
    def likes_count(self):
        return self.liked_by.count()

    # Automatically set the order when saving a new song
    def save(self, *args, **kwargs):
        if not self.pk:  # Only set order for new songs
            # Get the highest order number for this room
            last_order = Song.objects.filter(room=self.room).order_by('-order').first()
            self.order = (last_order.order + 1) if last_order else 0
        super().save(*args, **kwargs)

    # Delete file when the song is deleted
    def delete(self, *args, **kwargs):
        # Get the file path before deleting the model
        file_path = self.file.path if self.file else None
        
        # Delete the model first
        super().delete(*args, **kwargs)
        
        # Then delete the file if it exists
        if file_path and os.path.isfile(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error deleting file {file_path}: {str(e)}")

    class Meta:
        ordering = ['order']  # Order songs by their order field by default


class SongInfo(models.Model):
    song = models.OneToOneField(Song, on_delete=models.CASCADE, related_name='info')
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    cover_picture = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.title} by {self.artist}"

    class Meta:
        verbose_name = 'Song Information'
        verbose_name_plural = 'Song Information'
        
    def delete(self, *args, **kwargs):
        # Check if file exists before deleting
        if self.cover_picture and os.path.isfile(self.cover_picture.path):
            os.remove(self.cover_picture.path)  # Delete the file
        super().delete(*args, **kwargs)
   

