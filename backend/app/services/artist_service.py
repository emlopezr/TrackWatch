from app.exceptions import BadRequestException, NotFoundException, ErrorCode
from .user_service import find_user_by_id
from app.models import UserFollowedArtist

def follow_artist(user_id: str, artist, access_token: str):
  user = find_user_by_id(user_id)
  if user is None:
    raise NotFoundException(ErrorCode.USER_NOT_FOUND)

  user.validate_token(access_token)

  if user.followed_artists.filter(artist_id=artist.id).exists():
    raise BadRequestException(ErrorCode.USER_ALREADY_FOLLOWS_THIS_ARTIST)

  UserFollowedArtist.objects.create(
    user=user,
    artist_id=artist.id,
    artist_name=artist.name
  )
  return user.followed_artists.all()

def unfollow_artist(user_id: str, artist_id: str, access_token: str):
  user = find_user_by_id(user_id)
  if user is None:
    raise NotFoundException(ErrorCode.USER_NOT_FOUND)

  user.validate_token(access_token)

  artist_obj = user.followed_artists.filter(artist_id=artist_id).first()
  if artist_obj is None:
    raise BadRequestException(ErrorCode.USER_DOES_NOT_FOLLOW_THIS_ARTIST)

  artist_obj.delete()
  return user.followed_artists.all()
