from datetime import datetime

class CustomException(Exception):
  def __init__(self, error_code, message=None, details=""):
    self.error_code = error_code
    self.message = message or error_code[1]
    self.details = details
    super().__init__(self.message)

class BadRequestException(CustomException): pass
class UnauthorizedException(CustomException): pass
class SpotifyReauthorizationRequiredException(UnauthorizedException): pass
class ForbiddenException(CustomException): pass
class NotFoundException(CustomException): pass
class InternalServerErrorException(CustomException): pass

class ErrorCode:
  UNHANDLED_EXCEPTION = ("UNHANDLED_EXCEPTION", "Unhandled exception")
  USER_NOT_FOUND = ("USER_NOT_FOUND", "User not found")
  USER_ALREADY_EXISTS = ("USER_ALREADY_EXISTS", "User already exists")
  USER_ALREADY_FOLLOWS_THIS_ARTIST = ("USER_ALREADY_FOLLOWS_THIS_ARTIST", "User already follows this artist")
  USER_DOES_NOT_FOLLOW_THIS_ARTIST = ("USER_DOES_NOT_FOLLOW_THIS_ARTIST", "User does not follow this artist")
  USER_INVALID_CREDENTIALS = ("USER_INVALID_CREDENTIALS", "Invalid user credentials")
  INVALID_REQUEST_BODY = ("INVALID_REQUEST_BODY", "Invalid request body")
  SPOTIFY_INVALID_ACCESS_TOKEN = ("SPOTIFY_INVALID_ACCESS_TOKEN", "Invalid Spotify access token")
  SPOTIFY_REAUTH_REQUIRED = ("SPOTIFY_REAUTH_REQUIRED", "Spotify reauthorization required")
  SPOTIFY_FORBIDDEN_REQUEST = ("SPOTIFY_FORBIDDEN_REQUEST", "Spotify API request forbidden request")
  SPOTIFY_USER_NOT_FOUND = ("SPOTIFY_USER_NOT_FOUND", "Spotify user not found")
  INVALID_ADMIN_CREDENTIALS = ("INVALID_ADMIN_CREDENTIALS", "Invalid admin credentials")

def exception_response_dto(status, code, message, details=""):
  return {
    "status": status,
    "code": code,
    "message": message,
    "details": details,
    "timestamp": datetime.now().isoformat(),
  }
