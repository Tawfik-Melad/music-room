# Generated by Django 5.0.2 on 2025-04-02 13:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('uploadRoom', '0003_song_liked_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='listening_users',
            field=models.JSONField(default=list),
        ),
    ]
