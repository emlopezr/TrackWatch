from .spotify_api_client import spotify_api_request
from app.exceptions import *

def get_spotify_user(access_token: str):
  try:
    response = spotify_api_request(
      method="GET",
      endpoint="/me",
      token=access_token
    )
    return map_to_spotify_user_dto(response)

  except Exception as e:
    if hasattr(e, "response") and hasattr(e.response, "status_code"):
      code = e.response.status_code
      msg = str(e)
      if code == 401: raise UnauthorizedException(ErrorCode.SPOTIFY_INVALID_ACCESS_TOKEN, details=msg)
      if code == 403: raise ForbiddenException(ErrorCode.SPOTIFY_FORBIDDEN_REQUEST, details=msg)
      if code == 404: raise BadRequestException(ErrorCode.SPOTIFY_USER_NOT_FOUND)

    raise InternalServerErrorException(
      ErrorCode.UNHANDLED_EXCEPTION,
      "Error while calling Spotify API",
      str(e)
    )

def map_to_spotify_user_dto(response: dict):
  explicit_content = response.get("explicit_content", {})
  images_json = response.get("images", [])

  return {
    "id": response.get("id"),
    "email": response.get("email"),
    "name": response.get("display_name"),
    "image_url": images_json[0]["url"] if images_json else "",
    "blocked_explicit_content": explicit_content.get("filter_enabled", False)
  }
