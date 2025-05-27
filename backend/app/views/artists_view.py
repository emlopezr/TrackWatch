from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from ..constants import Headers
import json
from app.classes.artist import Artist
from app.services import follow_artist as follow_artist_service
from app.services import unfollow_artist as unfollow_artist_service
from app.services.user_service import artist_to_dict

@require_POST
@csrf_exempt
def follow_artist(request):
  user_id = request.GET.get('userId')
  access_token = request.headers.get(Headers.SPOTIFY_ACCESS_TOKEN)
  artist_data = json.loads(request.body)

  artist = Artist(
    id=artist_data["id"],
    name=artist_data["name"]
  )

  artist_list = follow_artist_service(user_id, artist, access_token)
  result = [artist_to_dict(a) for a in artist_list]
  return JsonResponse(result, safe=False)


@require_POST
@csrf_exempt
def unfollow_artist(request):
  user_id = request.GET.get('userId')
  artist_id = request.GET.get('artistId')
  access_token = request.headers.get(Headers.SPOTIFY_ACCESS_TOKEN)

  artist_list = unfollow_artist_service(user_id, artist_id, access_token)
  result = [artist_to_dict(a) for a in artist_list]
  return JsonResponse(result, safe=False)
