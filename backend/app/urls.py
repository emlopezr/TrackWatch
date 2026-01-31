from django.urls import path
from . import views
from .constants import Endpoints

# Health check endpoints
health_urlpatterns = [
  path(Endpoints.PING, views.ping, name='ping'),
]

# Action endpoints
action_urlpatterns = [
  path(Endpoints.GENERATE_PLAYLIST, views.generate_artist_playlist, name='generate_artist_playlist'),
  path(Endpoints.UPDATE_RELEASES, views.update_new_releases, name='update_new_releases'),
]

# Artist endpoints
artist_urlpatterns = [
  path(Endpoints.FOLLOW_ARTIST, views.follow_artist, name='follow_artist'),
  path(Endpoints.UNFOLLOW_ARTIST, views.unfollow_artist, name='unfollow_artist'),
]

# User endpoints
user_urlpatterns = [
  path(Endpoints.REGISTER_USER, views.register_user, name='register_user'),
  path(Endpoints.GET_CURRENT_USER, views.get_current_user, name='get_current_user'),
  path(Endpoints.TOGGLE_PLAYLIST_UPDATES, views.toggle_playlist_updates, name='toggle_playlist_updates'),
]

# Legal endpoints
legal_urlpatterns = [
  path(Endpoints.EULA, views.get_eula, name='eula'),
  path(Endpoints.PRIVACY, views.get_privacy_policy, name='privacy'),
]

# Ghost Tracks endpoints
ghost_tracks_urlpatterns = [
  path(Endpoints.GHOST_TRACKS_PLAYLISTS, views.get_playlists, name='ghost_tracks_playlists'),
  path(Endpoints.GHOST_TRACKS_SCAN, views.scan_ghost_tracks, name='ghost_tracks_scan'),
  path(Endpoints.GHOST_TRACKS_REMOVE, views.remove_ghost_tracks, name='ghost_tracks_remove'),
]

# Combine all URL patterns
urlpatterns = (
  health_urlpatterns +
  action_urlpatterns +
  artist_urlpatterns +
  user_urlpatterns +
  legal_urlpatterns +
  ghost_tracks_urlpatterns
)
