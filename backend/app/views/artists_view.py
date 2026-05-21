from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json
from app.classes.artist import Artist
from app.services import follow_artist as follow_artist_service
from app.services import unfollow_artist as unfollow_artist_service
from app.services.user_service import artist_to_dict
from app.services.session_service import get_session_user, with_user_access_token

@require_POST
def follow_artist(request):
  artist_data = json.loads(request.body)
  user = get_session_user(request)

  artist = Artist(
    id=artist_data["id"],
    name=artist_data["name"]
  )

  artist_list = with_user_access_token(
    user,
    lambda access_token: follow_artist_service(user.id, artist, access_token)
  )
  result = [artist_to_dict(a) for a in artist_list]
  return JsonResponse(result, safe=False)


@require_POST
def unfollow_artist(request):
  artist_id = request.GET.get('artistId')
  user = get_session_user(request)

  artist_list = with_user_access_token(
    user,
    lambda access_token: unfollow_artist_service(user.id, artist_id, access_token)
  )
  result = [artist_to_dict(a) for a in artist_list]
  return JsonResponse(result, safe=False)
