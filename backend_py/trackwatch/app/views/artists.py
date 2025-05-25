from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
import json

@require_POST
@csrf_exempt
def follow_artist(request):
  user_id = request.GET.get('userId')
  access_token = request.headers.get('X-Spotify-Access-Token')
  artist = json.loads(request.body)

  # --- Call artistService.followArtist(user_id, artist, access_token) ---
  return JsonResponse({"result": []})  # Replace with actual artist list


@require_POST
@csrf_exempt
def unfollow_artist(request):
  user_id = request.GET.get('userId')
  artist_id = request.GET.get('artistId')
  access_token = request.headers.get('X-Spotify-Access-Token')

  # --- Call artistService.unfollowArtist(user_id, artist_id, access_token) ---
  return JsonResponse({"result": []})  # Replace with actual artist list

