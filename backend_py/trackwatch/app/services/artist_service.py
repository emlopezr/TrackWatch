from app.exceptions import BadRequestException, NotFoundException, ErrorCode
from .user_service import find_user_by_id

def follow_artist(user_id: str, artist, access_token: str):
  user = find_user_by_id(user_id)
  if user is None:
    raise NotFoundException(ErrorCode.USER_NOT_FOUND)

  user.validate_token(access_token)

  if any(a.id == artist.id for a in user.followed_artists):
    raise BadRequestException(ErrorCode.USER_ALREADY_FOLLOWS_THIS_ARTIST)

  user.followed_artists.append(artist)
  user.save_user()
  return user.followed_artists

def unfollow_artist(user_id: str, artist_id: str, access_token: str):
  user = find_user_by_id(user_id)
  if user is None:
    raise NotFoundException(ErrorCode.USER_NOT_FOUND)

  user.validate_token(access_token)

  artist_obj = next((a for a in user.followed_artists if a.id == artist_id), None)
  if artist_obj is None:
    raise BadRequestException(ErrorCode.USER_DOES_NOT_FOLLOW_THIS_ARTIST)

  user.followed_artists.remove(artist_obj)
  user.save_user()
  return user.followed_artists
