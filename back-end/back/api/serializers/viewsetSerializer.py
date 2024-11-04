from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth.hashers import check_password
from django.contrib.auth.hashers import make_password
from django.core.files.storage import DefaultStorage
from datetime import datetime, timedelta
from rest_framework import serializers

import json
import re
import os

from ..models import User, Friend, Game, GameInvitation

# ---------------------------------------------- VIEW SET ---------------------------------------------- #

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class GameListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'

class GameInvitationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameInvitation
        fields = '__all__'

class FriendListSerializer(serializers.ModelSerializer):
    user_username = serializers.SerializerMethodField()
    friend_username = serializers.SerializerMethodField()

    class Meta:
        model = Friend
        fields = '__all__'

    def get_user_username(self, obj):
        return obj.user.username

    def get_friend_username(self, obj):
        return obj.friend.username
# ---------------------------------------------- API ---------------------------------------------- #