from django.db import models
from django.contrib.postgres.fields import ArrayField

def user_directory_path(instance, filename):
	ext = filename.split('.')[-1]
	return f'profile_pictures/user_{instance.id}_profile_picture.{ext}' # CHANGE TO USER ID_PROFILE_PIC IN CASE A USER CHANGE HIS USERNAME TO AN OLD ONE EXISTING

def default_badges():
    return {
        'bully': False,
        'flash': False,
        'trophy': False,
        'lucky': False,
        'winner': False,
    }

class User(models.Model):
	username = models.CharField(max_length=255, blank=True, null= True)
	score = models.IntegerField(default=0)
	profile_picture = models.ImageField(upload_to=user_directory_path, default='profile_pictures/casper.png')
	is_2fa = models.BooleanField(default=False)
	badges = models.JSONField(default=default_badges)
	password = models.CharField(max_length=255)
	secret_2fa = models.CharField(max_length=255, blank=True, null= True)

	status = models.CharField(max_length=255, default="offline")
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.username

class Friend(models.Model):
	STATUS_CHOICES = [
		('PENDING', 'Pending'),
		('ACCEPTED', 'Accepted'),
		('REJECTED', 'Rejected'),
	]

	user = models.ForeignKey(User, related_name='friends', on_delete=models.CASCADE)
	friend = models.ForeignKey(User, related_name='friend_of', on_delete=models.CASCADE)
	status = models.CharField(choices=STATUS_CHOICES, default="PENDING")
	created_at = models.DateTimeField(auto_now_add=True)
	def __str__(self):
		return f"Friendship between {self.user.username} and {self.friend.username}"

class Game(models.Model):
	STATUS_CHOICES = [
		('PENDING', 'Pending'),
		('COMPLETED', 'Completed'),
	]

	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player1')
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player2', null=True, blank=True)
	winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='games_won')
	status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='PENDING')
	start_time = models.DateTimeField(auto_now_add=True)
	end_time = models.DateTimeField(null=True, blank=True)
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)

	def __str__(self):
		return f"Game between {self.player1.username} and {self.player2.username if self.player2 else 'TBD'}"

class GameInvitation(models.Model):
	STATUS_CHOICES = [
		('PENDING', 'Pending'),
		('ACCEPTED', 'Accepted'),
		('REJECTED', 'Rejected'),
		('CANCELLED', 'Cancelled'),
	]

	sender = models.ForeignKey(User, related_name='game_invitations_sent', on_delete=models.CASCADE)
	receiver = models.ForeignKey(User, related_name='game_invitations_received', on_delete=models.CASCADE)
	status = models.CharField(choices=STATUS_CHOICES, default="PENDING")
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Game invitation from {self.sender.username} to {self.receiver.username}"
