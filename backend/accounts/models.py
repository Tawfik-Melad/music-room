from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE , related_name='profile')
    profile_picture = models.ImageField(upload_to='profile_pictures/',
                                        default='profile_pictures/default.jpg', 
                                        blank=True, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.user.username

