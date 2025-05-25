from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt

@require_POST
@csrf_exempt
def register_user(request):
  access_token = request.headers.get('X-Spotify-Access-Token')
  refresh_token = request.headers.get('X-Spotify-Refresh-Token')

  # --- Call userService.registerUser(access_token, refresh_token) ---
  return JsonResponse({"result": {}})  # Replace with actual UserResponseDTO, use status=201 if needed


@require_GET
def get_current_user(request):
  access_token = request.headers.get('X-Spotify-Access-Token')
  refresh_token = request.headers.get('X-Spotify-Refresh-Token')

  # --- Call userService.getCurrentUser(access_token, refresh_token) ---
  return JsonResponse({"result": {}})  # Replace with actual UserResponseDTO
