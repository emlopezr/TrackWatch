from django.urls import path
from . import views

health_urlpatterns = [
  path('ping', views.ping, name='ping'),
]

action_urlpatterns = [
  path('actions/generate', views.generate_artist_playlist, name='generate_artist_playlist'),
  path('actions/releases', views.update_new_releases, name='update_new_releases'),
]

artist_urlpatterns = [
  path('artists/follow', views.follow_artist, name='follow_artist'),
  path('artists/unfollow', views.unfollow_artist, name='unfollow_artist'),
]

user_urlpatterns = [
  path('users/register', views.register_user, name='register_user'),
  path('users/me', views.get_current_user, name='get_current_user'),
]

urlpatterns = (
  health_urlpatterns +
  action_urlpatterns +
  artist_urlpatterns +
  user_urlpatterns
)
