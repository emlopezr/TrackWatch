from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from app.constants import Headers, System
from app.services import generate_artist_playlist as generate_artist_playlist_use_case, update_new_releases_for_all_users
from decouple import config
from app.exceptions import ForbiddenException, ErrorCode

@require_POST
@csrf_exempt
def generate_artist_playlist(request):
  user_id = request.GET.get('userId')
  artist_id = request.GET.get('artistId')
  playlist_id = request.GET.get('playlistId')
  access_token = request.headers.get(Headers.SPOTIFY_ACCESS_TOKEN)

  playlist_id = generate_artist_playlist_use_case(user_id, artist_id, playlist_id, access_token)
  return JsonResponse({"message": "Playlist generated", "playlistId": playlist_id})


@require_POST
@csrf_exempt
def update_new_releases(request):
  admin_key = request.headers.get(Headers.ADMIN_KEY)

  days_limit = request.GET.get('daysLimit')
  days_limit = int(days_limit) if days_limit else System.FILTER_DAYS_LIMIT

  if admin_key != config("SECRET_KEY"):
    raise ForbiddenException(ErrorCode.INVALID_ADMIN_CREDENTIALS)

  result = update_new_releases_for_all_users(days_limit)
  return JsonResponse(result)
