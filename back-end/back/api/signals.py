from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import User
import os

AI_PASSWORD= os.getenv("AI_PASSWORD")

@receiver(post_migrate)
def create_ai_users(**kwargs):
    ai_users = [
        {'username': 'AI_easy', 'password': AI_PASSWORD},
        {'username': 'AI_medium', 'password': AI_PASSWORD},
        {'username': 'AI_hard', 'password': AI_PASSWORD},
    ]
    for ai_user in ai_users:
        if not User.objects.filter(username=ai_user['username']).exists():
            User.objects.create(**ai_user)