from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import Q

import jwt

from ..utils import JWTCookieValidator
from ..models import Friend, User

class FriendRequestSerializer:
	def __init__(self, request=None, JWT_user_id=None):
		self.fields = ['user', 'friend']
		self.request = request
		self.JWT_user_id = JWT_user_id

		self.user = None
		self.friend = None
		self.object = None

	class SerializerError(Exception):
		pass

	def validate(self):
		for field in self.fields:
			if field not in self.request:
				raise self.SerializerError(field + " field is required")
		
		try:
			self.user = User.objects.get(username=self.request["user"])
			self.friend = User.objects.get(username=self.request["friend"])
		except User.DoesNotExist:
			raise self.SerializerError("User doesn't exist")

		if not self.JWT_user_id == self.user.id:
			raise self.SerializerError("Unauthorized: user trying to add friend for another use")

		if self.user == self.friend:
			raise self.SerializerError("You cannot send a friend request to yourself")

		if Friend.objects.filter(Q(user=self.user, friend=self.friend, status="ACCEPTED") | Q(user=self.friend, friend=self.user, status="ACCEPTED")):
			raise self.SerializerError(self.user.username + " is already friend with " + self.friend.username)

		if Friend.objects.filter(user=self.user, friend=self.friend, status="PENDING").exists():
			raise self.SerializerError("Friend request already sent")

	def save(self):
		if Friend.objects.filter(user=self.friend, friend=self.user, status="PENDING").exists():
			self.object = Friend.objects.get(user=self.friend, friend=self.user, status="PENDING")
			self.object.status = "ACCEPTED"
			self.object.save()
		else:
			self.object = Friend.objects.create(user=self.user, friend=self.friend)
			# =========================
			channel_layer = get_channel_layer()
			user_group_name = f'user_{self.friend.id}'
			async_to_sync(channel_layer.group_send)(
				user_group_name,
				{
					"type": "send_notification",
					"notification_type": "friend_request",
					"content": {
						"id": self.object.id,
						"user": self.object.user.username
					}
				}
			)
			# =========================

class UpdateFriendRequestSerializer:
    def __init__(self, request=None, friendship_id=None, JWT_user_id=None):
        self.friendship_id = friendship_id
        self.request = request
        self.JWT_user_id = JWT_user_id
        self.fields = ['status']
        self.status_fields = ['PENDING', 'ACCEPTED', 'REJECTED']

        self.friendship = None
    
    class SerializerError(Exception):
        pass

    def validate(self):
        try:
            self.friendship = Friend.objects.get(pk=self.friendship_id)

            if not self.friendship.friend.id == self.JWT_user_id:
                raise self.SerializerError("Unauthorized: user trying to update another user friend request")
            
            for field in self.fields:
                if not field in self.request:
                    raise self.SerializerError(field + " field is required")

            if self.request['status'] not in self.status_fields:
                raise self.SerializerError("Status field is not valid")

            if not self.friendship.status == "PENDING":
                raise self.SerializerError("Friend request already validated or declined")

        except Friend.DoesNotExist:
            raise self.SerializerError("Friendship_id is invalid")
    
    def save(self):
        self.friendship.status = self.request['status']
        self.friendship.save()

class DeleteFriendSerializer:
    def __init__(self, friendship_id=None, JWT_user_id=None):
        self.friendship_id = friendship_id
        self.JWT_user_id = JWT_user_id

        self.friendship = None
    
    class SerializerError(Exception):
        pass

    def validate(self):
        try:
            self.friendship = Friend.objects.get(pk=self.friendship_id)

            if not self.friendship.friend.id == self.JWT_user_id and not self.friendship.user.id == self.JWT_user_id:
                raise self.SerializerError("Unauthorized: user trying to update another user friend request")

            if not self.friendship.status == "ACCEPTED":
                raise self.SerializerError("This friendship is not validated yet")

        except Friend.DoesNotExist:
            raise self.SerializerError("Friendship_id is invalid")
    
    def delete(self):
        self.friendship.delete()