from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth.hashers import check_password
from django.contrib.auth.hashers import make_password
from django.db.models import Sum
from django.db.models import Q

from ..models import User, Game, Friend
import json
import re

class UserProfileSerializer:
	def __init__(self, user=None, is_public=False):
		self.user = user
		self.is_public = is_public

	def get_profile_json(self):
		total_games = Game.objects.filter(Q(player1=self.user, status="completed") | Q(player2=self.user, status="completed"))
		total_wins = total_games.filter(winner=self.user).count()
		total_loses = total_games.count() - total_wins
		winrate = 0 if total_games.count() == 0 else (total_wins / total_games.count()) * 100

		total_goals_as_p1 = Game.objects.filter(player1=self.user).aggregate(total_score=Sum('score_player1')).get('total_score', 0)
		total_goals_as_p1 = 0 if total_goals_as_p1 is None else total_goals_as_p1
		total_goals_as_p2 = Game.objects.filter(player2=self.user).aggregate(total_score=Sum('score_player2')).get('total_score', 0)
		total_goals_as_p2 = 0 if total_goals_as_p2 is None else total_goals_as_p2
		total_goals = total_goals_as_p1 + total_goals_as_p2

		total_goals_taken_as_p1 = Game.objects.filter(player1=self.user).aggregate(total_score=Sum('score_player2')).get('total_score', 0)
		total_goals_taken_as_p1 = 0 if total_goals_taken_as_p1 is None else total_goals_taken_as_p1
		total_goals_taken_as_p2 = Game.objects.filter(player2=self.user).aggregate(total_score=Sum('score_player1')).get('total_score', 0)
		total_goals_taken_as_p2 = 0 if total_goals_taken_as_p2 is None else total_goals_taken_as_p2
		total_goals_taken = total_goals_taken_as_p1 + total_goals_taken_as_p2
		ratio = total_goals if total_goals_taken == 0 else total_goals / total_goals_taken
		data = {
			'id': self.user.id,
			'username': self.user.username,
			'score': self.user.score,
			'stats': {
				'total_wins': total_wins,
				'total_loses': total_loses,
				'winrate': round(winrate, 1),
				'total_goals': total_goals,
				'total_goals_taken': total_goals_taken,
				'ratio': round(ratio, 1),
			},
			'profile_picture': self.user.profile_picture.name,
			'status': self.user.status
		}
		if not self.is_public:
			data['is_2fa'] = self.user.is_2fa
		return data
    
	def get_game_list_json(self):
		games = Game.objects.filter(Q(player1=self.user, status="completed") | Q(player2=self.user, status="completed"))
		game_list = []
		for game in games:
			if game.winner:
				game_list.append({
					"id": game.id,
					"player1_id": game.player1.username,
					"player2_id": game.player2.username if game.player2 else None,
					"winner": game.winner.username,
					"status": game.status,
					"start_time": game.start_time.isoformat(),
					"end_time": game.end_time.isoformat(),
					"score_player1": game.score_player1,
					"score_player2": game.score_player2,
				})
		return game_list

	def get_friend_list_json(self):
		friends = Friend.objects.filter(Q(user=self.user, status="ACCEPTED") | Q(friend=self.user, status="ACCEPTED"))
		friend_list = []
		for friend in friends:
			friend = friend.friend if friend.user == self.user else friend.user

			friend_list.append({
				"username": friend.username,
				"profile_picture": friend.profile_picture.name,
				"score": friend.score,
				"status": friend.status
			})

		return friend_list

class SignUpSerializer:
	def __init__(self, request=None, file=None):
		self.request = request
		self.file = file
		self.required_fields = ['username', 'password', 'is_default_picture']

		self.is_default_picture = False
		self.is_2fa = False
		self.object = None

	class SerializerError(Exception):
		pass

	def is_default_picture_name_valid(self, filename):
		pattern = r'[<>:"/\\|?*]'

		if re.search(pattern, filename) is not None: # check no illegal char where used
			return False
		if not filename.lower().endswith(('.png', '.jpeg', '.jpg')): # check file extension
			return False
		if "profile" in filename: # check user is not trying to steal another user profile picture
			return False
		return True

	def validate(self):
		for field in self.required_fields:
			if field not in self.request:
				raise self.SerializerError(field + ' field is required.')

		if len(self.request["username"]) < 3:
			raise self.SerializerError("Username must be at least 3 characters")

		if len(self.request["password"]) < 3:
			raise self.SerializerError("Password must be at least 3 characters")

		if self.request['is_default_picture'] == 'true' or self.request['is_default_picture'] == 'True':
			self.is_default_picture = True

		if self.request.get('is_2fa') == 'true' or self.request.get('is_2fa') == 'True':
			self.is_2fa = True

		if User.objects.filter(username=self.request['username']).exists():
			raise self.SerializerError("A user with that username already exists")

		if self.is_default_picture:
			if 'profile_picture' not in self.request:
				raise self.SerializerError("Default profile picture name is missing")

			if not self.is_default_picture_name_valid(self.request['profile_picture']):
				raise self.SerializerError("Default profile picture name is invalid")
		else:
			if self.file == None:
				raise self.SerializerError("Profile picture is missing")

			max_upload_size = 10 * 1024 * 1024  # 10 MB limit
			if self.file.size > max_upload_size:
				raise self.SerializerError("The image file is too large. Size should not exceed 10 MB")

			if not self.file.content_type in ['image/jpeg', 'image/png']:
				raise self.SerializerError("Only JPEG and PNG images are allowed")

	def save(self):
		self.object = User.objects.create(
			username=self.request["username"],
			password=make_password(self.request["password"]),  # Hash the password
			profile_picture=self.file if not self.is_default_picture else 'profile_pictures/' + self.request['profile_picture'],
			is_2fa=self.is_2fa
		)

class SignInSerializer:
	def __init__(self, request=None):
		self.request = request
		self.required_fields = ["username", "password"]
		
		self.user = None

	class SerializerError(Exception):
		pass

	def validate(self):
		for field in self.required_fields:
			if field not in self.request:
				raise self.SerializerError(field + ' field is required')

		if len(self.request["username"]) < 3:
			raise self.SerializerError("Username must be at least 3 characters")

		if len(self.request["password"]) < 3:
			raise self.SerializerError("Password must be at least 3 characters")

		try:        
			self.user = User.objects.get(username=self.request["username"])
			user_hashed_password = self.user.password

			if not check_password(self.request["password"], user_hashed_password):
				raise self.SerializerError("Password does not match")

		except User.DoesNotExist:
				raise self.SerializerError("User doesn't exist")