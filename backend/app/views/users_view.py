from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from app.services.user_service import get_current_user as get_current_user_service
import json
from app.models import User
from app.exceptions import BadRequestException, UnauthorizedException, ErrorCode
from app.clients.spotify.spotify_user_api_client import get_spotify_user
from app.services.session_service import get_session_user, with_user_access_token

@require_POST
def register_user(request):
  user = get_session_user(request)
  return JsonResponse(get_current_user_service(user.current_access_token, user.current_refresh_token), status=200)

@ensure_csrf_cookie
@require_GET
def get_current_user(request):
  user = get_session_user(request)

  user_dict = with_user_access_token(
    user,
    lambda access_token: get_current_user_service(access_token, user.current_refresh_token)
  )
  return JsonResponse(user_dict, status=200)


@require_http_methods(["PATCH"])
def toggle_playlist_updates(request, id):

  try:
    body = json.loads(request.body.decode("utf-8")) if request.body else {}
  except json.JSONDecodeError:
    raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY)

  if "updatesEnabled" not in body or not isinstance(body["updatesEnabled"], bool):
    raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY)

  user = get_session_user(request)
  spotify_user = with_user_access_token(
    user,
    lambda access_token: get_spotify_user(access_token)
  )

  # Validate that the requester is the same user as the path parameter
  if spotify_user["id"] != id:
    raise UnauthorizedException(ErrorCode.USER_INVALID_CREDENTIALS)

  try:
    persisted_user = User.objects.get(id=id)
  except User.DoesNotExist:
    raise BadRequestException(ErrorCode.USER_NOT_FOUND)

  # Persist new state
  persisted_user.updates_enabled = body["updatesEnabled"]
  persisted_user.save(update_fields=["updates_enabled"])

  return JsonResponse({"updatesEnabled": persisted_user.updates_enabled}, status=200)
