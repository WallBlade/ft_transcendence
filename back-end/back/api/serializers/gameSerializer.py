from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from ..models import User, Game
from ..update_badges import update_flash
from django.utils import timezone

class GameSerializer:
	def __init__(self, request=None):
		self.request = request
		self.required_fields = ["player1", "player2"]
		self.object = None

	class SerializerError(Exception):
		pass

	def validate(self):
		for field in self.required_fields:
			if field not in self.request:
				raise self.SerializerError(field + " field is missing in request body")

		if not User.objects.filter(username=self.request["player1"]).exists():
			raise self.SerializerError("Player1 doesn't exist")
		if not User.objects.filter(username=self.request["player2"]).exists():
			raise self.SerializerError("Player2 doesn't exist")

	def save(self):
		player1 = User.objects.get(username=self.request["player1"])
		player1.status = "in_game"
		player1.save()
		channel_layer = get_channel_layer()
		async_to_sync(channel_layer.group_send)(
			'connected_users',
			{
				"type": "send_notification",
				"notification_type": "update_status",
				"user": player1.username,
				"status": "in_game"
			})

		player2 = User.objects.get(username=self.request["player2"])
		player2.status = "in_game"
		player2.save()
		async_to_sync(channel_layer.group_send)(
			'connected_users',
			{
				"type": "send_notification",
				"notification_type": "update_status",
				"user": player2.username,
				"status": "in_game"
			})

		self.object = Game.objects.create(
			player1 = player1,
			player2 = player2
		)

class UpdateGameSerializer:
	def __init__(self, request=None, game_id=None):
		self.request = request
		self.required_fields = ["winner", "score_player1", "score_player2"]
		self.game_id = game_id

		self.game = None
		self.winner = None
		self.object = None

	class SerializerError(Exception):

		pass

	def validate(self):
		try:
			self.game = Game.objects.get(pk=self.game_id)
			self.winner = User.objects.get(username=self.request["winner"])
			for field in self.required_fields:
				if field not in self.request:
					raise self.SerializerError(field + " field is missing in request body")
			
			if int(self.request["score_player1"]) < 0:
				raise self.SerializerError("score_player1 must a positive integer")
			if int(self.request["score_player2"]) < 0:
				raise self.SerializerError("score_player2 must a positive integer")
		
			if not self.game.player1 == self.winner and not self.game.player2 == self.winner:
				raise self.SerializerError("Winner is not player1 nor player2")

			if self.game.status == "COMPLETED":
				raise self.SerializerError("Game is already completed")

		except  Game.DoesNotExist:
			raise self.SerializerError("No game found with that id")
		except  User.DoesNotExist:
			raise self.SerializerError("No user found with that username")
		except (ValueError, TypeError):
			raise self.SerializerError("Score is not a valid integer")

	def update(self):
		if self.game.player1.username == "AI_easy":
			score = 25
		elif self.game.player1.username == "AI_medium":
			score = 50
		else:
			score = 100

		self.winner.score += score
		print(self.winner.score, "score")
		self.winner.save()
		self.game.winner = self.winner
		self.game.end_time = timezone.now()
		self.game.score_player1 = self.request["score_player1"]
		self.game.score_player2 = self.request["score_player2"]
		self.game.status = "completed"
		self.game.save()

		update_flash(self.winner, self.game)
		channel_layer = get_channel_layer()
		if self.game.player1.status == "in_game":
			player1 = User.objects.get(username=self.game.player1.username)
			player1.status = "online"
			player1.save()
			async_to_sync(channel_layer.group_send)(
				'connected_User',
				{
					"type": "send_notification",
					"notification_type": "update_status",
					"user": player1.username,
					"status": "online"
				})

		if self.game.player2.status == "in_game":
			player2 = User.objects.get(username=self.game.player2.username)
			player2.status = "online"
			player2.save()
			async_to_sync(channel_layer.group_send)(
				'connected_users',
				{
					"type": "send_notification",
					"notification_type": "update_status",
					"user": player2.username,
					"status": "online"
				})