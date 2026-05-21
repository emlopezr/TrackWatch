from urllib.parse import urlencode
from django.http import HttpResponse
from app.constants import Spotify
from app.exceptions import UnauthorizedException, ErrorCode, NotFoundException
from app.models import User
from app.services.user_service import get_valid_access_token


def get_public_origin(request):
  forwarded_proto = request.headers.get("X-Forwarded-Proto")
  forwarded_host = request.headers.get("X-Forwarded-Host")
  host = forwarded_host or request.get_host()
  proto = forwarded_proto or request.scheme or "http"
  return f"{proto}://{host}"


def get_spotify_redirect_uri(request):
  return f"{get_public_origin(request)}/callback"


def set_authenticated_session(request, user):
  request.session.cycle_key()
  request.session[Spotify.SESSION_USER_KEY] = user.id


def clear_authenticated_session(request):
  request.session.flush()


def get_session_user(request):
  user_id = request.session.get(Spotify.SESSION_USER_KEY)
  if not user_id:
    raise UnauthorizedException(ErrorCode.USER_INVALID_CREDENTIALS)

  try:
    return User.objects.get(id=user_id)
  except User.DoesNotExist:
    request.session.pop(Spotify.SESSION_USER_KEY, None)
    raise NotFoundException(ErrorCode.USER_NOT_FOUND)


def with_user_access_token(user, callback):
  try:
    return callback(user.current_access_token)
  except UnauthorizedException:
    refreshed_user = get_valid_access_token(user)
    return callback(refreshed_user.current_access_token)


def build_spotify_authorize_url(request, client_id):
  params = urlencode({
    "client_id": client_id,
    "response_type": "code",
    "redirect_uri": get_spotify_redirect_uri(request),
    "state": request.session[Spotify.OAUTH_STATE_KEY],
    "scope": " ".join(Spotify.SCOPES),
  })
  return f"{Spotify.AUTH_BASE_URL}/authorize?{params}"


def proxy_spotify_response(response):
  content_type = response.headers.get("Content-Type", "application/json")
  proxied = HttpResponse(
    content=response.content,
    status=response.status_code,
    content_type=content_type,
  )
  retry_after = response.headers.get("Retry-After")
  if retry_after:
    proxied["Retry-After"] = retry_after
  return proxied
