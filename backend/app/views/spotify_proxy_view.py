from django.views.decorators.http import require_GET, require_http_methods
from app.clients.spotify.spotify_api_client import spotify_api_raw_request
from app.exceptions import UnauthorizedException, ErrorCode
from app.services.session_service import get_session_user, with_user_access_token, proxy_spotify_response


def _proxy_request(request, endpoint, allowed_params):
  user = get_session_user(request)
  params = {key: value for key, value in request.GET.items() if key in allowed_params}

  def send_request(access_token):
    response = spotify_api_raw_request(
      method=request.method,
      endpoint=endpoint,
      token=access_token,
      params=params,
    )
    if response.status_code == 401:
      raise UnauthorizedException(ErrorCode.SPOTIFY_INVALID_ACCESS_TOKEN, details=response.text)
    return response

  response = with_user_access_token(user, send_request)
  return proxy_spotify_response(response)


@require_GET
def spotify_me(request):
  return _proxy_request(request, "/me", allowed_params=set())


@require_GET
def spotify_search(request):
  return _proxy_request(request, "/search", allowed_params={"q", "type", "limit", "offset"})


@require_GET
def spotify_artist_detail(request, artist_id):
  return _proxy_request(request, f"/artists/{artist_id}", allowed_params=set())


@require_http_methods(["GET", "PUT", "DELETE"])
def spotify_following(request):
  return _proxy_request(request, "/me/following", allowed_params={"type", "ids", "after", "limit"})
