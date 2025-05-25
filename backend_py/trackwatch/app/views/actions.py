from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt

@require_POST
@csrf_exempt
def generate_artist_playlist(request):
  user_id = request.GET.get('userId')
  artist_id = request.GET.get('artistId')
  playlist_id = request.GET.get('playlistId')
  access_token = request.headers.get('X-Spotify-Access-Token')

  # --- Call generateArtistPlaylistUseCase here ---
  return JsonResponse({"message": "Playlist generated"})


@require_POST
@csrf_exempt
def update_new_releases(request):
  admin_key = request.headers.get('X-Admin-Key')
  days_limit = request.GET.get('daysLimit')

  # --- Call searchFollowedReleasesUseCase.updateNewReleasesForAllUsers(days_limit) ---
  return JsonResponse({"message": "New releases updated for all users"})
