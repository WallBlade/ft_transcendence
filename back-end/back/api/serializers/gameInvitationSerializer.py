from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from ..models import User, GameInvitation

class GameInvitationSerializer:
	def __init__(self, request=None, user_id=None):
		self.request = request
		self.user_id = user_id

		self.sender = None
		self.receiver = None
		self.object = None

	class SerializerError(Exception):
		pass

	def validate(self):
		for field in ["receiver"]:
			if field not in self.request:
				raise self.SerializerError(field + " field is missing in request body")
		try:
			self.sender = User.objects.get(id=self.user_id)
			self.receiver = User.objects.get(username=self.request["receiver"])

			if self.sender == self.receiver:
				raise self.SerializerError("Sender and receiver must be different")

			# if GameInvitation.objects.filter(sender=self.sender, receiver=self.receiver, status="pending").exists():
			# 	raise self.SerializerError("Game invitation already sent") PROBLEM IF USER WAS OFFLINE WHEN RECEIVING THE INVITATION

			if self.receiver.status == "offline":
				raise self.SerializerError("Receiver is offline")

			if self.receiver.status == "in_game":
				raise self.SerializerError("Receiver is already in game")

		except User.DoesNotExist:
			raise self.SerializerError("Sender or receiver does not exist")

	def save(self):
		self.object = GameInvitation.objects.create(
			sender = self.sender,
			receiver = self.receiver
		)
		channel_layer = get_channel_layer()
		channel_name = f"user_{self.receiver.id}"
		
		async_to_sync(channel_layer.group_send)(
			channel_name,
			{
				"type": "send_notification",
				"notification_type": "game_invitation",
				"content": {
					"id": self.object.id,
					"user_id": self.sender.id,
					"user": self.sender.username
				}
			})

class GameInvitationUpdateSerializer:
	def __init__(self, request=None, user_id=None, game_invitation_id=None):
		self.request = request
		self.user_id = user_id

		self.game_invitation_id = game_invitation_id
		self.game_invitation = GameInvitation.objects.get(id=self.game_invitation_id)

	class SerializerError(Exception):
		pass

	def validate(self):
		try:
			self.game_invitation = GameInvitation.objects.get(id=self.game_invitation_id)

			if "status" not in self.request:
				raise self.SerializerError("status field is missing in request body")

			if self.request["status"] not in ["ACCEPTED", "REJECTED", "CANCELLED"]:
				raise self.SerializerError("Status must be ACCEPTED or REJECTED")

			user = User.objects.get(id=self.user_id)
			
			if user != self.game_invitation.receiver and user != self.game_invitation.sender:
				raise self.SerializerError("Unauthorized: user trying to update game invitation for another user")

			if self.game_invitation.status != "PENDING":
				raise self.SerializerError("Game invitation is not pending")

			if self.request['status'] == "ACCEPTED" and self.game_invitation.sender.status == "offline":
				self.game_invitation.status = "REJECTED"
				self.game_invitation.save()
				raise self.SerializerError("Sender is offline")

			if self.request['status'] == "ACCEPTED" and self.game_invitation.sender.status == "in_game":
				raise self.SerializerError("Sender is already in game")

		except GameInvitation.DoesNotExist:
			raise self.SerializerError("Game invitation not found")
		except User.DoesNotExist:
			raise self.SerializerError("JWT user not found")

	def save(self):
		self.game_invitation.status = self.request['status']
		self.game_invitation.save()

		if self.request['status'] == "ACCEPTED":
			channel_layer = get_channel_layer()

			channel_name = f"user_{self.game_invitation.sender.id}"
			async_to_sync(channel_layer.group_send)(
				channel_name,
				{
					"type": "send_notification",
					"notification_type": "start_remote_game",
					"game_channel_name": f"game_{self.game_invitation.id}",
				})

			channel_name = f"user_{self.game_invitation.receiver.id}"
			async_to_sync(channel_layer.group_send)(
				channel_name,
				{
					"type": "send_notification",
					"notification_type": "start_remote_game",
					"game_channel_name": f"game_{self.game_invitation.id}",
				})

		if self.request['status'] == "REJECTED":
			channel_layer = get_channel_layer()
			channel_name = f"user_{self.game_invitation.sender.id}"
			async_to_sync(channel_layer.group_send)(
				channel_name,
				{
					"type": "send_notification",
					"notification_type": "game_invitation_declined",
					"content": {
						"id": self.game_invitation.id,
						"user_id": self.game_invitation.receiver.id,
						"user": self.game_invitation.receiver.username
					}
				})
