from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from ..constants import Headers

@require_POST
@csrf_exempt
def generate_artist_playlist(request):
  user_id = request.GET.get('userId')
  artist_id = request.GET.get('artistId')
  playlist_id = request.GET.get('playlistId')
  access_token = request.headers.get(Headers.SPOTIFY_ACCESS_TOKEN)

  # --- Call generateArtistPlaylistUseCase here ---
  return JsonResponse({"message": "Playlist generated"})


@require_POST
@csrf_exempt
def update_new_releases(request):
  admin_key = request.headers.get(Headers.ADMIN_KEY)
  days_limit = request.GET.get('daysLimit')

  # --- Call searchFollowedReleasesUseCase.updateNewReleasesForAllUsers(days_limit) ---
  return JsonResponse({"message": "New releases updated for all users"})
