from .spotify_api_client import spotify_api_request
from app.exceptions import InternalServerErrorException, ErrorCode
import time

def add_tracks_to_playlist(user, playlist_id, track_uris):
  body = {"uris": track_uris}
  try:
    response = spotify_api_request(
      method="POST",
      endpoint=f"/playlists/{playlist_id}/tracks",
      token=user.current_access_token,
      json_data=body
    )
    return response
  except Exception as e:
    raise InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, str(e))

def get_playlist_tracks(user, playlist_id):
  track_uris = []
  offset = 0
  limit = 100
  try:
    while True:
      response = spotify_api_request(
        method="GET",
        endpoint=f"/playlists/{playlist_id}/tracks",
        token=user.current_access_token,
        params={"limit": limit, "offset": offset}
      )
      uris = map_response_to_track_uris(response)
      track_uris.extend(uris)
      offset += limit
      total = response.get("total", 0)
      if offset >= total:
        break
    return track_uris
  except Exception as e:
    raise InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, str(e))

def filter_saved_tracks(user, uris):
  ids = [uri.split(":")[-1] for uri in uris]
  filtered_uris = []
  limit = 50

  try:
    for i in range(0, len(ids), limit):
      chunk = ids[i:i+limit]
      ids_param = ",".join(chunk)

      response = spotify_api_request(
        method="GET",
        endpoint="/me/tracks/contains",
        token=user.current_access_token,
        params={"ids": ids_param}
      )
      saved_statuses = response

      for idx, id_ in enumerate(chunk):
        if not saved_statuses[idx]:
          filtered_uris.append(f"spotify:track:{id_}")

    return filtered_uris
  except Exception as e:
    raise InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, str(e))

def create_playlist(user, name, description, is_public):
  body = {
    "name": name,
    "description": description,
    "public": is_public
  }
  try:
    response = spotify_api_request(
      method="POST",
      endpoint=f"/users/{user.id}/playlists",
      token=user.current_access_token,
      json_data=body
    )
    return response["id"]
  except Exception as e:
    raise InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, str(e))

def check_playlist_exists_with_retries(user, max_retries=5, delay_s=0.5):
  for _ in range(max_retries):
    if check_playlist_exists(user):
      return True
    time.sleep(delay_s)
  return False

def check_playlist_exists(user):
  user_playlist_id = user.playlist_id
  offset = 0
  limit = 50
  all_playlists = []
  try:
    while True:
      response = spotify_api_request(
        method="GET",
        endpoint="/me/playlists",
        token=user.current_access_token,
        params={"limit": limit, "offset": offset}
      )
      items = response.get("items", [])
      collect_playlist_items(items, all_playlists)
      playlist_ids = [pl["id"] for pl in items if isinstance(pl, dict)]
      if user_playlist_id in playlist_ids:
        return True
      offset += limit
      total = response.get("total", 0)
      if offset >= total:
        break
    return False
  except Exception as e:
    raise InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, str(e))

def update_playlist_cover(user, playlist_id, image_base64):
  try:
    spotify_api_request(
      method="PUT",
      endpoint=f"/playlists/{playlist_id}/images",
      token=user.current_access_token,
      data=image_base64,
      headers={"Content-Type": "image/jpeg"}
    )
  except Exception as e:
    print(f"Error updating playlist cover: {e}")
    # raise InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, str(e))

def collect_playlist_items(items, all_playlists):
  for playlist in items:
    if isinstance(playlist, dict):
      all_playlists.append({
        "id": playlist.get("id"),
        "name": playlist.get("name")
      })

def map_response_to_track_uris(response):
  items = response.get("items", [])
  uris = []
  for item in items:
    track = item.get("track") if isinstance(item, dict) else None
    if track and track.get("uri"):
      uris.append(track["uri"])
  return uris
