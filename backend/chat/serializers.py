from rest_framework import serializers
from .models import Message
from accounts.serializers import UserSerializer 

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Message
        fields = ['id','room', 'user', 'content', 'timestamp']
        read_only_fields = ['user', 'room']

