from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from http.cookies import SimpleCookie



import django
import os
import json
import urllib.parse

from .utils import JWTCookieValidator
from .models import User, GameInvitation, Game

RED = '\033[91m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
RESET = '\033[0m'

class GameConsumer(AsyncWebsocketConsumer):
	rooms = {}

	async def connect(self):
		headers = dict(self.scope['headers'])
		jwt = self.get_jwt_from_headers(headers)

		if not jwt:
			await self.close(code = 4004)
		try:
			jwt_cookie_validator = JWTCookieValidator(token=jwt)
			jwt_cookie_validator.validate()
			user_id = jwt_cookie_validator.get_user_id()
			self.user = await self.get_user(user_id)

			if not self.user:
				await self.close(code = 4004)
				return

			await self.accept()
			self.username = self.user.username
			query = self.scope['query_string']
			query_string = urllib.parse.unquote_plus(query.decode())
			query_dict = urllib.parse.parse_qs(query_string)
			self.host = query_dict.get('host')[0]
			self.opponent = query_dict.get('opponent')[0]
		

			self.room_name = f"Gameroom_{self.host}"
			if self.room_name not in self.rooms:
				self.rooms[self.room_name] = {'players':{}}
			self.rooms[self.room_name]['players'][self.username] = self.channel_name

			await self.channel_layer.group_add(self.room_name, self.channel_name)
			await self.channel_layer.group_send(
				self.room_name,
				{
					'type': 'game_start',
					'players': [self.host, self.opponent],
					'host': self.host
				}
			)

		except jwt_cookie_validator.AuthorizationError as e:
			await self.close(code = 4004)

	@database_sync_to_async
	def getGameID(self):
		hostUser = User.objects.get(username=self.host)
		opponentUser = User.objects.get(username=self.opponent)
		game = Game.objects.filter(player1=hostUser, player2=opponentUser).order_by('-start_time').first()
		return game.id
	
	async def disconnect(self, close_code):
		if hasattr(self, 'room_name') :
			print(f"{RED}{self.username} disconnected from room {self.room_name}{RESET}")
			
			id = await self.getGameID()

			await self.channel_layer.group_send(
				self.room_name,
				{
					'type': 'game_stop',
					'game_id': id
				})
	
	async def game_stop(self, content):
		await self.send(text_data=json.dumps({
			'type': 'game_stop',
			'game_id': content['game_id']
		}))


	async def receive(self, text_data):
		message = json.loads(text_data)
		await self.update_game_state(message, self.username)

	async def update_game_state(self, data, username):
		game_state = {
		'ballX' : data.get('ballX'),
		'ballZ' : data.get('ballZ'),
		'paddle1Z' : data.get('paddle1Z'),
		'paddle2Z': data.get('paddle2Z'),
		'score1' : data.get('score1'),
		'score2' : data.get('score2'),
		}
		
		receiver_channel = None
		
		if self.room_name in self.rooms:
			players = self.rooms[self.room_name]['players']
			for player in players:
				if player != username:
					receiver_channel = players[player]
					break
			
		if receiver_channel:
			await self.channel_layer.send(
				receiver_channel,
				{
					'type': 'game_state',
					'game_state': game_state
				}
			)
	
	async def game_state(self, event):
		await self.send(text_data=json.dumps(event['game_state']))

	async def game_start(self, event):
		player_names = event['players']
		if self.username == event['host']:
			player_role = 'player1'
		else:
			player_role = 'player2'
		await self.send(text_data=json.dumps({
			'type': 'game_start',
			'players': player_names,
			'player_role': player_role
		}))
		
	def get_jwt_from_headers(self, headers):
		if not b'cookie' in headers:
			return None

		cookies_header = headers[b'cookie'].decode()
		cookie = SimpleCookie()
		cookie.load(cookies_header)
		
		if 'jwt' in cookie:
			return cookie['jwt'].value
		return None

	@database_sync_to_async
	def get_user(self, user_id):
		try:
			return User.objects.get(id=user_id)
		except User.DoesNotExist:
			return None
	
# ============================== NOTIFS ============================== #
		
class NotificationConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		headers = dict(self.scope['headers'])
		jwt = self.get_jwt_from_headers(headers)

		if not jwt:
			print(f"{RED}JWT not found in cookies when user tried to connect to websocket{RESET}")
			await self.close()
			return

		try:
			jwt_cookie_validator = JWTCookieValidator(token=jwt)
			jwt_cookie_validator.validate()
			user_id = jwt_cookie_validator.get_user_id()
			self.user = await self.get_user(user_id)

			if self.user == None:
				print(f"{RED}JWT user not found{RESET}")
				await self.close()

			await self.channel_layer.group_send(
				'connected_users',
				{
					"type": "send_notification",
					"notification_type": "update_status",
					"user": self.user.username,
					"status": "online"
				})

			self.user_group_name = f'user_{self.user.id}'
			await self.channel_layer.group_add(self.user_group_name, self.channel_name)
			await self.channel_layer.group_add('connected_users', self.channel_name)

			await self.accept()
			await self.update_user_status("online")
			print(f"{GREEN}{self.user.username} connected to websocket{RESET}")

		except jwt_cookie_validator.AuthorizationError as e:
			print(f"{RED}JWT not valid{RESET}")
			await self.close()

	async def disconnect(self, close_code):
		if self.user:
			self.user = await self.get_user(self.user.id)
			await self.update_invitations_status()

			await self.channel_layer.group_send(
				'connected_users',
				{
					"type": "send_notification",
					"notification_type": "update_status",
					"user": self.user.username,
					"status": "offline"
				})
			await self.update_user_status("offline")
		print(f"{RED}{self.user.username} disconnected of websocket{RESET}")

	async def receive(self, text_data):
		message = json.loads(text_data)
		notification_type = message.get('notification_type')
		if notification_type == 'leave_waiting_room':
			await self.update_invitations_status()

		print(f"{YELLOW}Received message: {message}{RESET}")

# =================================== UTILS =================================== #

	@database_sync_to_async
	def update_invitations_status(self):
		invitations = GameInvitation.objects.filter(sender=self.user, status='PENDING')

		for invitation in invitations:
			invitation.status = "CANCELLED"
			invitation.save()

	def get_jwt_from_headers(self, headers):
		if not b'cookie' in headers:
			return None

		cookies_header = headers[b'cookie'].decode()
		cookie = SimpleCookie()
		cookie.load(cookies_header)
		
		if 'jwt' in cookie:
			return cookie['jwt'].value
		return None

	@database_sync_to_async
	def get_user(self, user_id):
		try:
			return User.objects.get(id=user_id)
		except User.DoesNotExist:
			return None

	@database_sync_to_async
	def update_user_status(self, status):
		self.user.status = status
		self.user.save()

	async def send_notification(self, content):
		if content.get('notification_type') == 'update_status':
			await self.send(text_data=json.dumps({
				'notification_type': content.get('notification_type'),
				'user': content.get('user'),
				'status': content.get('status')
			}))
		elif content.get('notification_type') == 'friend_request':
			await self.send(text_data=json.dumps({
				'notification_type': content.get('notification_type'),
				'content': content.get('content')
			}))
		elif content.get('notification_type') == 'game_invitation':
			await self.send(text_data=json.dumps({
				'notification_type': content.get('notification_type'),
				'content': content.get('content')
			}))
		elif content.get('notification_type') == 'start_remote_game':
			await self.send(text_data=json.dumps({
				'notification_type': content.get('notification_type'),
				'content': content.get('content')
			}))
		elif content.get('notification_type') == 'game_invitation_declined':
			await self.send(text_data=json.dumps({
				'notification_type': content.get('notification_type'),
				'content': content.get('content')
			}))