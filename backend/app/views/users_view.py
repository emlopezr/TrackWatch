from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from django.views.decorators.csrf import csrf_exempt
from ..constants import Headers
from app.services import register_user as register_user_service
from app.services.user_service import user_response_dict, get_current_user as get_current_user_service
import json
from app.models import User
from app.exceptions import BadRequestException, UnauthorizedException, ErrorCode
from app.clients.spotify.spotify_user_api_client import get_spotify_user

@require_POST
@csrf_exempt
def register_user(request):
  access_token = request.headers.get(Headers.SPOTIFY_ACCESS_TOKEN)
  refresh_token = request.headers.get(Headers.SPOTIFY_REFRESH_TOKEN)

  user = register_user_service(access_token, refresh_token)
  user_dict = user_response_dict(user)
  return JsonResponse(user_dict, status=201)

@require_GET
def get_current_user(request):
  access_token = request.headers.get(Headers.SPOTIFY_ACCESS_TOKEN)
  refresh_token = request.headers.get(Headers.SPOTIFY_REFRESH_TOKEN)

  user = get_current_user_service(access_token, refresh_token)
  return JsonResponse(user, status=200)


@require_http_methods(["PATCH"])
@csrf_exempt
def toggle_playlist_updates(request, id):

  try:
    body = json.loads(request.body.decode("utf-8")) if request.body else {}
  except json.JSONDecodeError:
    raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY)

  if "updatesEnabled" not in body or not isinstance(body["updatesEnabled"], bool):
    raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY)

  access_token = request.headers.get(Headers.SPOTIFY_ACCESS_TOKEN)
  refresh_token = request.headers.get(Headers.SPOTIFY_REFRESH_TOKEN)

  # Validate that the requester is the same user as the path parameter
  spotify_user = get_spotify_user(access_token)
  if spotify_user["id"] != id:
    raise UnauthorizedException(ErrorCode.USER_INVALID_CREDENTIALS)

  try:
    user = User.objects.get(id=id)
  except User.DoesNotExist:
    raise BadRequestException(ErrorCode.USER_NOT_FOUND)

  # Persist new state
  user.updates_enabled = body["updatesEnabled"]
  user.update_tokens(access_token, refresh_token)
  user.save()

  return JsonResponse({"updatesEnabled": user.updates_enabled}, status=200)
