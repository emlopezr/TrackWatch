from urllib.parse import urlencode, urlparse
from django.conf import settings
from django.http import HttpResponse
from app.constants import Spotify
from app.exceptions import BadRequestException, UnauthorizedException, ErrorCode, NotFoundException
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


def get_allowed_redirect_origins(request):
  return {
    *getattr(settings, "CORS_ALLOWED_ORIGINS", []),
    get_public_origin(request),
  }


def validate_spotify_redirect_uri(request, redirect_uri):
  parsed = urlparse(redirect_uri or "")
  origin = f"{parsed.scheme}://{parsed.netloc}"

  if (
    parsed.scheme not in {"http", "https"}
    or not parsed.netloc
    or parsed.path != "/callback"
    or parsed.params
    or parsed.query
    or parsed.fragment
    or origin not in get_allowed_redirect_origins(request)
  ):
    raise BadRequestException(
      ErrorCode.INVALID_REQUEST_BODY,
      details="Invalid Spotify redirect URI",
    )

  return redirect_uri


def get_session_spotify_redirect_uri(request):
  return request.session.get(Spotify.OAUTH_REDIRECT_URI_KEY) or get_spotify_redirect_uri(request)


def set_session_spotify_redirect_uri(request, redirect_uri):
  request.session[Spotify.OAUTH_REDIRECT_URI_KEY] = validate_spotify_redirect_uri(request, redirect_uri)


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


def build_spotify_authorize_url(request, client_id, redirect_uri=None):
  params = urlencode({
    "client_id": client_id,
    "response_type": "code",
    "redirect_uri": redirect_uri or get_spotify_redirect_uri(request),
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
