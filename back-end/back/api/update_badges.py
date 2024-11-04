from django.db.models import Q
from .models import Game, User
from django.utils.timezone import timedelta

def update_bully(user):
    if user.badges['bully'] == False:
        wins = Game.objects.filter(winner=user).count()
        losses = Game.objects.filter(
            Q(player1=user) | Q(player2=user),
            ~Q(winner=user),
            status='completed'
        ).count()

        # Check if wins are at least three times the number of losses
        if wins > 3 * losses:
            user.badges['bully'] = True
            user.save()

def update_flash(user, game):
    if user.badges['flash'] == False:
        duration = game.end_time - game.start_time
        if duration < timedelta(seconds=30):
            user.badges['flash'] = True
            user.save()

def update_trophy(user):
    if user.badges['trophy'] == False:
        if user.score >= 200:
            user.badges['trophy'] = True
            user.save()
    
def update_winner(user):
    if user.badges['winner'] == False:
        wins = Game.objects.filter(winner=user).count()
        if wins >= 5:
            user.badges['winner'] = True
            user.save()

def update_lucky(user):
    if user.badges['lucky'] == False:
        wins = Game.objects.filter(winner=user)
        count = 0
        for win in wins:
            if abs(win.score_player1 - win.score_player2) == 1:
                count += 1
            if count >= 5:
                user.badges['lucky'] = True
                user.save()
                break

