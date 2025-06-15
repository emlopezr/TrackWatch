from app.models import User
from app.exceptions import BadRequestException, NotFoundException, ErrorCode
from app.clients.spotify.spotify_user_api_client import get_spotify_user
from app.clients.spotify.spotify_auth_api_client import refresh_access_token_with_retries
from .playlist_service import create_playlist_for_user, update_playlist_cover
from .email_service import send_welcome_email
from app.constants import Assets

def get_all_users():
  users = list(User.objects.all())
  return [user for user in users if not user.is_staff]

def register_user(access_token: str, refresh_token: str):
  spotify_user = get_spotify_user(access_token)

  if User.objects.filter(id=spotify_user['id']).exists():
    raise BadRequestException(ErrorCode.USER_ALREADY_EXISTS)

  user = User(
    id=spotify_user['id'],
    email=spotify_user['email'],
    name=spotify_user.get('display_name') or spotify_user.get('name', ''),
    image_url=spotify_user.get('image_url', ''),
    current_access_token=access_token,
    current_refresh_token=refresh_token
  )

  user.save()

  playlist_id = create_playlist_for_user(user)
  # update_playlist_cover(user, playlist_id, Assets.DEFAULT_PLAYLIST_COVER_URL)

  user.playlist_id = playlist_id
  user.save()

  send_welcome_email(user)
  return user_response_dict(user)

def get_current_user(access_token: str, refresh_token: str):
  spotify_user = get_spotify_user(access_token)

  try:
    user = User.objects.get(id=spotify_user['id'])
  except User.DoesNotExist:
    raise NotFoundException(ErrorCode.USER_NOT_FOUND)

  user.update_tokens(access_token, refresh_token)
  return user_response_dict(user)

def get_valid_access_token(user: User):
  refresh_token = user.current_refresh_token
  new_tokens = refresh_access_token_with_retries(refresh_token)
  user.update_tokens(new_tokens['access_token'], new_tokens['refresh_token'])
  return user

def find_user_by_id(user_id: str):
  try: return User.objects.get(id=user_id)
  except User.DoesNotExist: return None

def user_settings_to_dict(settings):
  return {
    "blocked_explicit_content": getattr(settings, "setting_blocked_explicit_content", False)
  }

def artist_to_dict(artist):
  return {
    "id": artist.artist_id if hasattr(artist, 'artist_id') else artist.id,
    "name": artist.artist_name if hasattr(artist, 'artist_name') else artist.name
  }

def user_response_dict(user):
  return {
    "id": user.id,
    "playlist_id": user.playlist_id,
    "email": user.email,
    "name": user.name,
    "image_url": user.image_url,
    "settings": user_settings_to_dict(user),
    "followed_artists": [artist_to_dict(a) for a in user.followed_artists.all()] or []
  }