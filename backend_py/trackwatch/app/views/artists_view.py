from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from ..constants import Headers
import json
from app.classes.artist import Artist
from app.services import follow_artist, unfollow_artist

@require_POST
@csrf_exempt
def follow_artist(request):
  user_id = request.GET.get('userId')
  access_token = request.headers.get(Headers.SPOTIFY_ACCESS_TOKEN)
  artist_data = json.loads(request.body)

  artist = Artist(
    id=artist_data["id"],
    name=artist_data["name"],
    image_url=artist_data.get("image_url", "")
  )

  artist_list = follow_artist(user_id, artist, access_token)
  result = [Artist.to_dict(a) for a in artist_list]
  return JsonResponse({"result": result})


@require_POST
@csrf_exempt
def unfollow_artist(request):
  user_id = request.GET.get('userId')
  artist_id = request.GET.get('artistId')
  access_token = request.headers.get(Headers.SPOTIFY_ACCESS_TOKEN)

  artist_list = unfollow_artist(user_id, artist_id, access_token)
  result = [Artist.to_dict(a) for a in artist_list]
  return JsonResponse({"result": result})

