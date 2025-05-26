import time
from app.constants import Assets, Playlist, System
from app.clients.spotify.spotify_playlist_api_client import create_playlist, add_tracks_to_playlist as spotify_add_tracks, get_playlist_tracks, filter_saved_tracks, update_playlist_cover as spotify_update_playlist_cover, check_playlist_exists_with_retries
from app.utils.image_helper import encode_image_to_base64
from app.models import User

def create_playlist_for_user(
  user: User,
  name: str = Playlist.DEFAULT_NAME,
  description: str = Playlist.DEFAULT_DESCRIPTION,
  is_public: bool = Playlist.DEFAULT_PRIVACY
) -> str:
  return create_playlist(user, name, description, is_public)

def add_tracks_to_playlist(
  user: User,
  playlist_id: str,
  tracks_to_add,
  filter_uris_by_existing_in_playlist: bool = True,
  filter_uris_by_saved_by_user: bool = True
):
  track_uris = get_track_uris_from_tracks(tracks_to_add)

  if filter_uris_by_existing_in_playlist:
    track_uris = filter_uris_not_in_playlist(user, playlist_id, track_uris)

  if filter_uris_by_saved_by_user:
    track_uris = filter_uris_saved_by_user(user, track_uris)

  # Chunk in batches of 100
  for i in range(0, len(track_uris), 100):
    chunk = list(track_uris)[i:i+100]
    spotify_add_tracks(user, playlist_id, chunk)

  return filter_tracks_by_uris(tracks_to_add, track_uris)

def check_and_create_playlist_if_needed(user: User):
  playlist_exists = check_playlist_exists_with_retries(user)

  if not playlist_exists:
    playlist_id = create_playlist_for_user(user)
    spotify_update_playlist_cover(user, playlist_id, Assets.DEFAULT_PLAYLIST_COVER_URL)
    user.playlist_id = playlist_id
    user.save_user(user)

def update_playlist_cover(user: User, playlist_id: str, cover_url: str):
  try:
    time.sleep(System.DEFAULT_WAIT_TIME_SECONDS)
    cover_base64 = encode_image_to_base64(cover_url)
    if cover_base64 is None: return
    spotify_update_playlist_cover(user, playlist_id, cover_base64)
  except Exception as e:
    print(f"Error while updating playlist cover: {str(e)}")

def get_track_uris_from_tracks(tracks):
  return [track.uri for track in tracks]

def filter_uris_not_in_playlist(user: User, playlist_id: str, track_uris):
  tracks_in_playlist = get_playlist_tracks(user, playlist_id)
  return [uri for uri in track_uris if uri not in tracks_in_playlist]

def filter_uris_saved_by_user(user: User, track_uris):
  return filter_saved_tracks(user, track_uris)

def filter_tracks_by_uris(tracks, uris):
  return [track for track in tracks if track.uri in uris]
