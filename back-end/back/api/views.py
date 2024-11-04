from .utils import generate_jwt_token, JWTCookieValidator
from .models import User, Friend, Game, GameInvitation
from back import settings

from .serializers.friendSerializer import FriendRequestSerializer, UpdateFriendRequestSerializer, DeleteFriendSerializer
from .serializers.viewsetSerializer import GameListSerializer, UserListSerializer, FriendListSerializer, GameInvitationListSerializer
from .serializers.userSerializer import UserProfileSerializer, SignUpSerializer, SignInSerializer
from .serializers.twoFactorSerializer import TwoFactorQRSetupSerializer, TwoFactorAuthSerializer
from .serializers.gameSerializer import GameSerializer, UpdateGameSerializer
from .serializers.gameInvitationSerializer import GameInvitationSerializer, GameInvitationUpdateSerializer

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, views
from rest_framework import viewsets

from django.core.files.uploadedfile import SimpleUploadedFile
from django.http import HttpResponse
from django.http import JsonResponse
from django.core.files import File
from django.utils import timezone
from django.db.models import Q
from django.views import View

import json
import sys
import jwt
import os

from django.views.decorators.csrf import csrf_exempt
from .update_badges import update_bully, update_trophy, update_winner, update_lucky
# ================================ VIEW SET ================================ #

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserListSerializer

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameListSerializer

class GameInvitationViewSet(viewsets.ModelViewSet):
    queryset = GameInvitation.objects.all()
    serializer_class = GameInvitationListSerializer

class FriendViewSet(viewsets.ModelViewSet):
    queryset = Friend.objects.all()
    serializer_class = FriendListSerializer

# ================================ USER ================================ #

class PrivateProfileView(View):
    def get(self, request):
        try:
            jwt_cookie_validator = JWTCookieValidator(request.COOKIES.get('jwt', None))
            jwt_cookie_validator.validate()
            user_id = jwt_cookie_validator.get_user_id()
            user = User.objects.get(id=user_id)
            user_serializer = UserProfileSerializer(user=user, is_public=False)
            update_bully(user)
            update_lucky(user)
            update_trophy(user)
            update_winner(user)
            response = {
                "ok": True,
                "message": "Profile received successfully",
                "user": user_serializer.get_profile_json(),
                "games": user_serializer.get_game_list_json(),
                "friends": user_serializer.get_friend_list_json(),
                "is_auth": True,
                "badges": user.badges
            }
            return JsonResponse(response, status=200)

        except jwt_cookie_validator.AuthorizationError as e:
            return JsonResponse({"ok": False, "message": str(e), "is_auth": False}, status=400)
        except User.DoesNotExist:
            return JsonResponse({"ok": False, "message": "User not found", "is_auth": False}, status=404)

    def post(self, request):
        if request.content_type != "multipart/form-data":
            return JsonResponse({"ok": False, "message": "Invalid content type. Expected multipart/form-data."}, status=400)
        try:
            jwt_cookie_validator = JWTCookieValidator(request.COOKIES.get('jwt', None))
            jwt_cookie_validator.validate()
            user_id = jwt_cookie_validator.get_user_id()
            user = User.objects.get(id=user_id)

            if "is_2fa" in request.POST:
                if request.POST["is_2fa"] == "False" or request.POST["is_2fa"] == "false":
                    user.is_2fa = False

            if "new_profile_picture" in request.FILES:
                if not request.FILES["new_profile_picture"].content_type in ['image/jpeg', 'image/png']:
                    return JsonResponse({"ok": False, "message": "Invalid file type. Expected image/jpeg or image/png."}, status=400)
                
                old_file_path = user.profile_picture.path
                if os.path.isfile(old_file_path):
                     os.remove(old_file_path)
                user.profile_picture = request.FILES["new_profile_picture"]

            user.save()

            return JsonResponse({"ok": True, "message": "Profile updated successfully", "is_auth": True}, status=200)
    
        except jwt_cookie_validator.AuthorizationError as e:
            return JsonResponse({"ok": False, "message": str(e), "is_auth": False}, status=400)
        except User.DoesNotExist:
            return JsonResponse({"ok": True, "message": "User not found", "is_auth": False}, status=404)

class PublicProfileView(View):
    def get(self, request, user_id):
        try:
            jwt_cookie_validator = JWTCookieValidator(request.COOKIES.get('jwt', None))
            jwt_cookie_validator.validate()
        
            user = User.objects.get(username=user_id)
            user_serializer = UserProfileSerializer(user=user, is_public=True)
            update_bully(user)
            update_lucky(user)
            update_trophy(user)
            update_winner(user)
            response = {
                "ok": True,
                "message": "Profile received successfully",
                "user": user_serializer.get_profile_json(),
                "games": user_serializer.get_game_list_json(),
                "friends": user_serializer.get_friend_list_json(),
                "is_auth": True,
                "badges": user.badges
            }
            return JsonResponse(response, status=200)

        except jwt_cookie_validator.AuthorizationError as e:
            return JsonResponse({"ok": False, "message": str(e), "is_auth": False}, status=400)
        except User.DoesNotExist:
            return JsonResponse({"ok": False, "message": user_id + " user not found", "is_auth": True}, status=404)

class SignInView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            
            signin_serializer = SignInSerializer(request=data)
            signin_serializer.validate()
            
            if signin_serializer.user.is_2fa == True:
                request.session['pre_2fa_user_id'] = signin_serializer.user.id
                return JsonResponse({"ok": True, "message": "Signin successful, please send 2FA code", "is_2fa": True}, status=200)

            response = HttpResponse(json.dumps({
                "ok": True,
                "message": "Signin successful",
                "is_2fa": False,
            }), content_type='application/json', status=200)

            response.set_cookie(
                'jwt', 
                generate_jwt_token(signin_serializer.user.id),
                max_age=3600
            )
            return response

        except json.JSONDecodeError as e:
            return JsonResponse({"ok": False, "message": "Invalid JSON body"}, status=400)
        except signin_serializer.SerializerError as e:
            return JsonResponse({"ok": False, "message": str(e)}, status=400)

class SignUpView(View):
    def post(self, request):
        if request.content_type != "multipart/form-data":
            return JsonResponse({"ok": False, "message": "Invalid content type. Expected multipart/form-data."}, status=400)

        try:
            signup_serializer = SignUpSerializer(request=request.POST, file=request.FILES.get('profile_picture'))
            signup_serializer.validate()
            signup_serializer.save()

            user_profile_serializer = UserProfileSerializer(signup_serializer.object)

            response = HttpResponse(json.dumps({
                "ok": True,
                "message": "Signup successful",
            }), content_type='application/json', status=201)

            response.set_cookie(
                'jwt', 
                generate_jwt_token(signup_serializer.object.id),
                max_age=3600
            )
            return response

        except signup_serializer.SerializerError as e:
            return JsonResponse({"ok": False, "message": str(e)}, status=400)

class LogoutView(View):
    def post(self, request):
        response = HttpResponse(json.dumps({
            "ok": True,
            "message": "Logout successful",
        }), content_type='application/json', status=301)
        response.delete_cookie('jwt')
        return response

class AuthCheckView(View):
    def get(self, request):
        try:
            jwt_cookie_validator = JWTCookieValidator(request.COOKIES.get('jwt', None))
            jwt_cookie_validator.validate()
            user_id = jwt_cookie_validator.get_user_id()
            user = User.objects.get(id=user_id)

            response = {
                "ok": True,
                "message": "User is authenticated",
                "is_auth": True
            }
            return JsonResponse(response, status=200)

        except jwt_cookie_validator.AuthorizationError as e:
            return JsonResponse({"ok": False, "message": str(e), "is_auth": False}, status=400)
        except User.DoesNotExist:
            return JsonResponse({"ok": False, "message": "User not found", "is_auth": False}, status=404)

# ================================ GAME ================================ #

class GameView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            game_serializer = GameSerializer(request=data)
            game_serializer.validate()
            game_serializer.save()

            response = {
                "ok": True,
                "message": "New game created successfully",
                "game_id": game_serializer.object.id
            }
            return JsonResponse(response, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"ok": False, "message": "Invalid JSON body"}, status=400)
        except game_serializer.SerializerError as e:
            print(str(e))
            return JsonResponse({"ok": False, "message": str(e)}, status=400)

class GameUpdateView(View):
    def patch(self, request, game_id):
        try:
            data = json.loads(request.body)

            update_game_serializer = UpdateGameSerializer(request=data, game_id=game_id)
            update_game_serializer.validate()
            update_game_serializer.update()

            return JsonResponse({"ok": True, "message": "Game updated successfully"}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"ok": False, "message": "Invalid JSON body"}, status=400)
        except update_game_serializer.SerializerError as e:
            print(str(e))
            return JsonResponse({"ok": False, "message": str(e)}, status=400)

# ================================ GAME INVITATION ================================ #

class GameInvitationView(View):
	def post(self, request):
		try:
			jwt_cookie_validator = JWTCookieValidator(request.COOKIES.get('jwt', None))
			jwt_cookie_validator.validate()
			user_id = jwt_cookie_validator.get_user_id()

			data = json.loads(request.body)

			game_invitation_serializer = GameInvitationSerializer(request=data, user_id=user_id)
			game_invitation_serializer.validate()
			game_invitation_serializer.save()

			response = {
				"ok": "True",
				"message": "Game invitation created successfully",
				"game_invitation_id": game_invitation_serializer.object.id
			}
			return JsonResponse(response,  status=201)

		except jwt_cookie_validator.AuthorizationError as e:
			return JsonResponse({"ok": False, "message": str(e)}, status=400)
		except json.JSONDecodeError:
			return JsonResponse({"ok": False, "message": "Invalid JSON body"}, status=400)
		except game_invitation_serializer.SerializerError as e:
			return JsonResponse({"ok": False, "message": str(e)}, status=400)

class GameInvitationUpdateView(View):
	def patch(self, request, game_invitation_id):
		try:
			jwt_cookie_validator = JWTCookieValidator(request.COOKIES.get('jwt', None))
			jwt_cookie_validator.validate()
			user_id = jwt_cookie_validator.get_user_id()

			data = json.loads(request.body)

			game_invitation_update_serializer = GameInvitationUpdateSerializer(request=data, user_id=user_id, game_invitation_id=game_invitation_id)
			game_invitation_update_serializer.validate()
			game_invitation_update_serializer.save()

			response = {
				"ok": "True",
				"message": "Game invitation updated successfully",
			}
			return JsonResponse(response,  status=201)

		except jwt_cookie_validator.AuthorizationError as e:
			return JsonResponse({"ok": False, "message": str(e)}, status=400)
		except json.JSONDecodeError:
			return JsonResponse({"ok": False, "message": "Invalid JSON body"}, status=400)
		except game_invitation_update_serializer.SerializerError as e:
			return JsonResponse({"ok": False, "message": str(e)}, status=400)

# ================================ LEADERBOARD ================================ #

class LeaderboardView(View):
    def get(self, request):
        excluded_usernames = ['AI_easy', 'AI_medium', 'AI_hard']
        top_users = User.objects.exclude(username__in=excluded_usernames).order_by('-score')[:20]
        leaderboard = []

        for user in top_users:
            total_wins = Game.objects.filter(winner=user).count()
            game_played = Game.objects.filter(Q(player1=user) | Q(player2=user)).count()
        
            if total_wins == 0 or game_played == 0:
                winrate = 0
            else:
                winrate = (total_wins / game_played) * 100

            leaderboard.append({
                "username": user.username,
                "score": user.score,
                "profile_picture": user.profile_picture.name,
                "total_wins": total_wins,
                "game_played": game_played,
                "win_rate": round(winrate)
            })

        response = {
            "ok": "True",
            "message": "Leaderboard received successfully",
            "leaderboard": leaderboard
        }
        return JsonResponse(response,  status=200)

# ================================ FRIEND ================================ #

class FriendView(View):
	def post(self, request):
		try:
			jwt_cookie_validator = JWTCookieValidator(request.COOKIES.get('jwt', None))
			jwt_cookie_validator.validate()
			user_id = jwt_cookie_validator.get_user_id()
			
			data = json.loads(request.body)

			friend_request_serializer = FriendRequestSerializer(request=data, JWT_user_id=user_id)
			friend_request_serializer.validate()
			friend_request_serializer.save()

			response = {
				"ok": "True",
				"message": "Friendship created successfully",
				"friendship_id": friend_request_serializer.object.id
			}
			return JsonResponse(response,  status=200)

		except jwt_cookie_validator.AuthorizationError as e:
			return JsonResponse({"ok": False, "message": str(e)}, status=400)
		except json.JSONDecodeError:
			return JsonResponse({"ok": False, "message": "Invalid JSON body"}, status=400)
		except friend_request_serializer.SerializerError as e:
			return JsonResponse({"ok": False, "message": str(e)}, status=400)

class FriendRequestListView(View):
    def get(self, request):
        try:
            jwt_cookie_validator = JWTCookieValidator(request.COOKIES.get('jwt', None))
            jwt_cookie_validator.validate()
            user_id = jwt_cookie_validator.get_user_id()
            user = User.objects.get(id=user_id)

            friend_requests = Friend.objects.filter(friend=user, status="pending").order_by('-id')

            friend_request_array = []

            for request in friend_requests:
                friend_request_array.append({
                    "id": request.id,
                    "user": request.user.username
                })

            return JsonResponse({
                "ok": True,
                "message": "Friend request list received successfully",
                "friendRequests": friend_request_array
            },  status=200)

        except jwt_cookie_validator.AuthorizationError as e:
            return JsonResponse({"ok": False, "message": str(e)}, status=400)
        except User.DoesNotExist:
            return JsonResponse({"ok": False, "message": "User not found"},  status=404)

class NotificationListView(View):
    def get(self, request):
        try:
            jwt_cookie_validator = JWTCookieValidator(request.COOKIES.get('jwt', None))
            jwt_cookie_validator.validate()
            user_id = jwt_cookie_validator.get_user_id()
            user = User.objects.get(id=user_id)

            friend_requests = Friend.objects.filter(friend=user, status="PENDING").order_by('-id')
            game_requests = GameInvitation.objects.filter(receiver=user, status="PENDING").order_by('-id')
            notification_list = []
            for request in friend_requests:
                notification_list.append({
                    "id": request.id,
                    "user": request.user.username,
                    "type": "friend_request",
                    "created_at": request.created_at
                })
            for request in game_requests:
                notification_list.append({
                    "id": request.id,
                    "user": request.sender.username,
                    "type": "game_invitation",
                    "created_at": request.created_at
                })
            notification_list = sorted(notification_list, key=lambda x: x['created_at'], reverse=True)
            return JsonResponse({
                "ok": True,
                "message": "Notifications list received successfully",
                "notifications_list": notification_list
            },  status=200)

        except jwt_cookie_validator.AuthorizationError as e:
            return JsonResponse({"ok": False, "message": str(e)}, status=400)
        except User.DoesNotExist:
            return JsonResponse({"ok": False, "message": "User not found"},  status=404)

class UpdateFriendView(View):
    def patch(self, request, friendship_id):
        try:
            jwt_cookie_validator = JWTCookieValidator(request.COOKIES.get('jwt', None))
            jwt_cookie_validator.validate()
            user_id = jwt_cookie_validator.get_user_id()

            data = json.loads(request.body)

            update_friend_request_serializer = UpdateFriendRequestSerializer(request=data, friendship_id=friendship_id, JWT_user_id=user_id)
            update_friend_request_serializer.validate()
            update_friend_request_serializer.save()

            response = {
                "ok": "True",
                "message": "Friend request status updated successfully",
            }
            return JsonResponse(response,  status=200)

        except jwt_cookie_validator.AuthorizationError as e:
            return JsonResponse({"ok": False, "message": str(e)}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"ok": False, "message": "Invalid JSON body"}, status=400)
        except update_friend_request_serializer.SerializerError as e:
            return JsonResponse({"ok": False, "message": str(e)}, status=400)

    def delete(self, request, friendship_id):
        try:
            jwt_cookie_validator = JWTCookieValidator(request.COOKIES.get('jwt', None))
            jwt_cookie_validator.validate()
            user_id = jwt_cookie_validator.get_user_id()

            delete_friend_serializer = DeleteFriendSerializer(friendship_id=friendship_id, JWT_user_id=user_id)
            delete_friend_serializer.validate()
            delete_friend_serializer.delete()

            return JsonResponse({"ok": "True", "message": "Friend was deleted successfully"},  status=200)

        except jwt_cookie_validator.AuthorizationError as e:
            return JsonResponse({"ok": False, "message": str(e)}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"ok": False, "message": "Invalid JSON body"}, status=400)
        except delete_friend_serializer.SerializerError as e:
            return JsonResponse({"ok": False, "message": str(e)}, status=400)

# ================================ 2FA ================================ #

class TwoFactorSetupView(View):
    def get(self, request):
        try:
            jwt_cookie_validator = JWTCookieValidator(request.COOKIES.get('jwt', None))
            jwt_cookie_validator.validate()
            user_id = jwt_cookie_validator.get_user_id()

            two_factor_qr_serializer = TwoFactorQRSetupSerializer(user_id=user_id)
            two_factor_qr_serializer.validate()
            two_factor_qr_serializer.generate_qr_code()

            return HttpResponse(two_factor_qr_serializer.image_bytes.read(), content_type="image/png")

        except jwt_cookie_validator.AuthorizationError as e:
            return JsonResponse({"ok": False, "message": str(e)}, status=400)
        except two_factor_qr_serializer.SerializerError as e:
            return JsonResponse({"ok": False, "message": str(e)}, status=400)

    def post(self, request):
        try:
            jwt_cookie_validator = JWTCookieValidator(request.COOKIES.get('jwt', None))
            jwt_cookie_validator.validate()
            user_id = jwt_cookie_validator.get_user_id()

            data = json.loads(request.body)

            two_FA_serializer = TwoFactorAuthSerializer(request=data, user_id=user_id)
            two_FA_serializer.validate()
            two_FA_serializer.user.is_2fa = True
            two_FA_serializer.user.save()

            return JsonResponse({"ok": True, "message": "2FA successfully activated"}, status=200)
        
        except jwt_cookie_validator.AuthorizationError as e:
            return JsonResponse({"ok": False, "message": str(e)}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"ok": False, "message": "Invalid JSON body"}, status=400)
        except two_FA_serializer.SerializerError as e:
            return JsonResponse({"ok": False, "message": str(e)}, status=400)

class TwoFactorAuthView(View):
    def post(self, request):
        try:
            user_id = request.session.get('pre_2fa_user_id')
            data = json.loads(request.body)

            two_FA_serializer = TwoFactorAuthSerializer(request=data, user_id=user_id)
            two_FA_serializer.validate()
            two_FA_serializer.check_auth()
            
            response = HttpResponse(json.dumps({
                "ok": True,
                "message": "Signin with 2FA successful",
            }), content_type='application/json', status=200)

            response.set_cookie(
                'jwt', 
                generate_jwt_token(two_FA_serializer.user.id),
                max_age=3600
            )
            return response

        except json.JSONDecodeError:
            return JsonResponse({"ok": False, "message": "Invalid JSON body"}, status=400)
        except two_FA_serializer.SerializerError as e:
            return JsonResponse({"ok": False, "message": str(e)}, status=404)