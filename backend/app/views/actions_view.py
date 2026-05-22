from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from app.constants import Headers, System
from app.services import generate_artist_playlist as generate_artist_playlist_use_case, update_new_releases_for_all_users
from decouple import config
from app.exceptions import ForbiddenException, ErrorCode
import threading
from app.services.session_service import get_session_user, with_user_access_token


def get_admin_key():
  return config("ADMIN_KEY", default=None) or config("SECRET_KEY")


@require_POST
def generate_artist_playlist(request):
  artist_id = request.GET.get('artistId')
  playlist_id = request.GET.get('playlistId')
  user = get_session_user(request)

  result = with_user_access_token(
    user,
    lambda access_token: generate_artist_playlist_use_case(user, artist_id, playlist_id, access_token)
  )

  return JsonResponse({
    "message": "Playlist generated",
    "playlistId": result["playlist_id"],
    "artistImageUrl": result["artist_image_url"]
  })


@csrf_exempt
@require_POST
def update_new_releases(request):
  admin_key = request.headers.get(Headers.ADMIN_KEY)

  if admin_key != get_admin_key():
    raise ForbiddenException(ErrorCode.INVALID_ADMIN_CREDENTIALS)

  days_limit = request.GET.get('daysLimit')
  days_limit = int(days_limit) if days_limit else System.FILTER_DAYS_LIMIT

  # Run in background thread to avoid Gunicorn worker timeout
  thread = threading.Thread(
    target=update_new_releases_for_all_users,
    args=(days_limit,),
    daemon=True
  )
  thread.start()

  return JsonResponse({
    "status": "started",
    "message": "New releases update started in background"
  })
