from app.exceptions import NotFoundException, ErrorCode
from .user_service import find_user_by_id
from app.clients.spotify import get_followed_artists, follow_artist as spotify_follow_artist, unfollow_artist as spotify_unfollow_artist


def get_user_followed_artists(access_token: str):
  """
  Get all artists the user follows on Spotify.
  Returns a list of Artist objects.
  """
  return get_followed_artists(access_token)


def follow_artist(user_id: str, artist, access_token: str):
  user = find_user_by_id(user_id)
  if user is None:
    raise NotFoundException(ErrorCode.USER_NOT_FOUND)

  user.validate_token(access_token)

  # Follow artist on Spotify
  spotify_follow_artist(access_token, artist.id)

  # Return updated list from Spotify
  return get_followed_artists(access_token)


def unfollow_artist(user_id: str, artist_id: str, access_token: str):
  user = find_user_by_id(user_id)
  if user is None:
    raise NotFoundException(ErrorCode.USER_NOT_FOUND)

  user.validate_token(access_token)

  # Unfollow artist on Spotify
  spotify_unfollow_artist(access_token, artist_id)

  # Return updated list from Spotify
  return get_followed_artists(access_token)
