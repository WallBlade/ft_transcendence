from rest_framework.routers import DefaultRouter
from django.urls import path, include

from .views import UserViewSet, GameViewSet, FriendViewSet, GameInvitationViewSet

from .views import PrivateProfileView, PublicProfileView, SignInView, SignUpView
from .views import FriendView, UpdateFriendView, FriendRequestListView, NotificationListView
from .views import GameView, GameUpdateView, LeaderboardView
from .views import GameInvitationView, GameInvitationUpdateView
from .views import TwoFactorSetupView, TwoFactorAuthView
from .views import LogoutView, AuthCheckView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'games', GameViewSet)
router.register(r'friends', FriendViewSet)
router.register(r'game_invitations', GameInvitationViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/profile/', PrivateProfileView.as_view(), name='private_profile'),
    path('api/profile/<str:user_id>/', PublicProfileView.as_view(), name='public_profile'),

    path('api/signin/', SignInView.as_view(), name='sign_in'),
    path('api/signup/', SignUpView.as_view(), name='sign_up'),
    
    path('api/auth_check/', AuthCheckView.as_view(), name='auth_check'),
    path('api/logout/', LogoutView.as_view(), name='logout'),

    path('api/game/', GameView.as_view(), name='game'),
    path('api/game/<str:game_id>/', GameUpdateView.as_view(), name='game'),
    path('api/leaderboard/', LeaderboardView.as_view(), name='leaderboard'),

    path('api/game_invitation/', GameInvitationView.as_view(), name='game_invitation'),
    path('api/game_invitation/<int:game_invitation_id>/', GameInvitationUpdateView.as_view(), name='game_invitation_update'),

    path('api/friend/', FriendView.as_view(), name='friend'),
    path('api/friend/<str:friendship_id>/', UpdateFriendView.as_view(), name='friend_update'),
    path('api/friend_requests/', FriendRequestListView.as_view(), name='friend_request_list'),
    path('api/notifications_list/', NotificationListView.as_view(), name='notifications_list'),

    path('api/2fa_setup/', TwoFactorSetupView.as_view(), name='2fa_setup'),
    path('api/2fa_auth/', TwoFactorAuthView.as_view(), name='2fa_auth')
]