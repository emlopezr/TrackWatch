from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from ..constants import Headers
from app.services import register_user
from app.services.user_service import user_response_dict

@require_POST
@csrf_exempt
def register_user(request):
  access_token = request.headers.get(Headers.SPOTIFY_ACCESS_TOKEN)
  refresh_token = request.headers.get(Headers.SPOTIFY_REFRESH_TOKEN)

  user = register_user(access_token, refresh_token)
  return JsonResponse({"result": user_response_dict(user)}, status=201)

@require_GET
def get_current_user(request):
  access_token = request.headers.get(Headers.SPOTIFY_ACCESS_TOKEN)
  refresh_token = request.headers.get(Headers.SPOTIFY_REFRESH_TOKEN)

  user = get_current_user(access_token, refresh_token)
  return JsonResponse({"result": user_response_dict(user)})
