from api.consumers import GameConsumer, NotificationConsumer
from django.urls import path

websocket_urlpatterns = [
    path('wss/game-online', GameConsumer.as_asgi()),
	path('wss/notification/', NotificationConsumer.as_asgi()),
]
