import json
import secrets
from decouple import config
from django.http import JsonResponse, HttpResponseRedirect, HttpResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
from app.constants import Spotify
from app.clients.spotify.spotify_api_client import spotify_auth_raw_request
from app.exceptions import BadRequestException, ErrorCode, UnauthorizedException
from app.services.session_service import (
  set_authenticated_session,
  clear_authenticated_session,
  build_spotify_authorize_url,
  get_spotify_redirect_uri,
)
from app.services.user_service import authenticate_spotify_user


def _parse_request_body(request):
  try:
    return json.loads(request.body.decode("utf-8")) if request.body else {}
  except json.JSONDecodeError:
    raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY)


@ensure_csrf_cookie
@require_GET
def spotify_login(request):
  request.session[Spotify.OAUTH_STATE_KEY] = secrets.token_urlsafe(32)
  client_id = config("SPOTIFY_CLIENT_ID")
  return HttpResponseRedirect(build_spotify_authorize_url(request, client_id))


@require_POST
def spotify_exchange(request):
  body = _parse_request_body(request)
  code = body.get("code")
  state = body.get("state")
  session_state = request.session.get(Spotify.OAUTH_STATE_KEY)

  if not code or not state:
    raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY)

  if not session_state or state != session_state:
    raise UnauthorizedException(ErrorCode.USER_INVALID_CREDENTIALS)

  response = spotify_auth_raw_request(
    method="POST",
    endpoint="/token",
    data={
      "code": code,
      "redirect_uri": get_spotify_redirect_uri(request),
      "grant_type": "authorization_code",
    },
    auth=(config("SPOTIFY_CLIENT_ID"), config("SPOTIFY_CLIENT_SECRET"))
  )

  data = response.json()
  if response.status_code >= 400:
    return JsonResponse(data, status=response.status_code)

  access_token = data.get("access_token")
  refresh_token = data.get("refresh_token")
  if not access_token or not refresh_token:
    raise UnauthorizedException(ErrorCode.SPOTIFY_INVALID_ACCESS_TOKEN)

  user, user_dict = authenticate_spotify_user(access_token, refresh_token)
  set_authenticated_session(request, user)
  request.session.pop(Spotify.OAUTH_STATE_KEY, None)
  return JsonResponse(user_dict, status=200)


@require_POST
def logout(request):
  clear_authenticated_session(request)
  return HttpResponse(status=204)
