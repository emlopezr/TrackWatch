from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from ..constants import Headers
from app.services import register_user as register_user_service
from app.services.user_service import user_response_dict, get_current_user as get_current_user_service

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
