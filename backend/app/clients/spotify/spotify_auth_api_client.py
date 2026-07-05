import time
from decouple import config
import requests
from .spotify_api_client import spotify_auth_request
from app.exceptions import InternalServerErrorException, ErrorCode, SpotifyReauthorizationRequiredException

INVALID_GRANT_ERROR = "invalid_grant"


def _spotify_error_code(exception):
  response = getattr(exception, "response", None)
  if response is None:
    return None

  try:
    return response.json().get("error")
  except ValueError:
    return None


def _is_invalid_grant(exception):
  return _spotify_error_code(exception) == INVALID_GRANT_ERROR


def _exception_details(exception):
  return getattr(exception, "details", str(exception))

def refresh_access_token_with_retries(refresh_token: str, max_attempts: int = 3):
  last_exception = None

  for attempt in range(1, max_attempts + 1):
    try: return refresh_access_token(refresh_token)
    except SpotifyReauthorizationRequiredException:
      raise
    except Exception as e:
      last_exception = e
      print(f"Spotify token refresh failed (attempt {attempt}/{max_attempts}): {_exception_details(e)}")
      if attempt < max_attempts:
        wait_time = 1 * attempt
        print(f"Retrying in {wait_time}s")
        time.sleep(wait_time)

  # If all attempts fail, throw the last exception
  if last_exception: raise last_exception
  else:
    raise InternalServerErrorException(
      ErrorCode.UNHANDLED_EXCEPTION,
      f"Failed to refresh Spotify access token after {max_attempts} attempts",
      "Unknown error"
    )

def refresh_access_token(refresh_token: str):
  client_id = config("SPOTIFY_CLIENT_ID")
  client_secret = config("SPOTIFY_CLIENT_SECRET")

  data = {
    "grant_type": "refresh_token",
    "refresh_token": refresh_token
  }

  try:
    resp = spotify_auth_request(
      method="POST",
      endpoint="/token",
      data=data,
      auth=(client_id, client_secret)
    )
    return map_to_spotify_token_dto(resp, refresh_token)

  except requests.HTTPError as e:
    if _is_invalid_grant(e):
      raise SpotifyReauthorizationRequiredException(
        ErrorCode.SPOTIFY_REAUTH_REQUIRED,
        details="Spotify refresh token is expired or invalid",
      )

    raise InternalServerErrorException(
      ErrorCode.UNHANDLED_EXCEPTION,
      "Error while calling Spotify API",
      str(e)
    )

  except Exception as e:
    raise InternalServerErrorException(
      ErrorCode.UNHANDLED_EXCEPTION,
      "Error while calling Spotify API",
      str(e)
    )

def map_to_spotify_token_dto(response: dict, refresh_token: str):
  return {
    "access_token": response.get("access_token"),
    "refresh_token": response.get("refresh_token") or refresh_token
  }
