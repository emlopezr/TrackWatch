from app.constants import *
from .user_service import find_user_by_id
from .playlist_service import *
from .track_service import *
from app.clients.spotify.spotify_artist_api_client import get_artist_info

def generate_artist_playlist(user_id, artist_id, playlist_id, access_token):
  user = retrieve_and_validate_user(user_id, access_token)
  artist = get_artist_info(artist_id, access_token)
  print(f"Generating playlist for artist: {artist.name}")

  tracks = collect_artist_tracks(artist, access_token)
  filtered_tracks = filter_and_sort_tracks(tracks, user, artist)

  final_playlist_id = create_or_update_playlist(user, artist.name, playlist_id)
  update_playlist_content(user, final_playlist_id, filtered_tracks, artist.image_url)

  print(f"Playlist generated for artist: {artist.name}")

def retrieve_and_validate_user(user_id, access_token):
  user = find_user_by_id(user_id)
  if user is None:
    from app.exceptions import NotFoundException, ErrorCode
    raise NotFoundException(ErrorCode.USER_NOT_FOUND)
  user.validate_token(access_token)
  return user

def collect_artist_tracks(artist, access_token):
  findings = set()
  iteration = 0

  while True:
    tracks = search_artist_tracks_with_retries(
      artist,
      access_token,
      days_limit=None,
      page=iteration
    )

    if (
      not tracks or
      not add_tracks_to_findings(tracks, findings, artist) or
      iteration >= System.MAX_LOOP_ITERATION
    ):
      break

    iteration += 1

  return findings

def filter_and_sort_tracks(tracks, user, artist):
  tracks_to_add = set()

  for track in tracks:
    filter_track(
      track,
      user,
      artist,
      tracks_to_add,
      days_limit=0,
      should_check_correct_artist=True,
      should_check_track_in_time_range=False,
      should_check_compilation_album=True,
      should_check_song_blocked_by_user_settings=False,
      should_check_track_recently_added=False
    )

  sorted_tracks = list(sort_tracks(tracks_to_add))
  filtered_tracks = remove_duplicate_tracks(sorted_tracks)
  return filtered_tracks

def create_or_update_playlist(user, artist_name, existing_playlist_id):
  playlist_name = generate_playlist_name(artist_name)
  playlist_description = generate_playlist_description(artist_name)

  if existing_playlist_id:
    return existing_playlist_id
  else:
    return create_playlist_for_user(user, name=playlist_name, description=playlist_description)

def update_playlist_content(user, playlist_id, tracks, cover_image_url):
  add_tracks_to_playlist(
    user,
    playlist_id,
    set(tracks),
    filter_uris_by_saved_by_user=False
  )
  try:
    update_playlist_cover(user, playlist_id, cover_image_url)
  except Exception:
    print(f"Failed to upload playlist cover for playlist: {playlist_id}")

def filter_tracks(artist, tracks):
  return [track for track in tracks if is_correct_artist(track, artist)]

def generate_playlist_name(artist_name):
  return f"All of: {artist_name}"

def generate_playlist_description(artist_name):
  return f"Every track from {artist_name} in one place (oldest to newest) - Powered by {AppInfo.APP_NAME}"

def add_tracks_to_findings(tracks, findings, artist):
  initial_size = len(findings)
  filtered_tracks = filter_tracks(artist, tracks)
  findings.update(filtered_tracks)
  return initial_size != len(findings)
