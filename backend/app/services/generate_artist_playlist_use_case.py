from app.constants import *
from .playlist_service import *
from .track_service import *
from app.clients.spotify.spotify_artist_api_client import get_artist_info

def generate_artist_playlist(user, artist_id, playlist_id, access_token):
  artist = get_artist_info(artist_id, access_token)
  print(f"Generating playlist for artist: {artist.name}")

  tracks = collect_artist_tracks(artist, access_token)
  filtered_tracks = filter_and_sort_tracks(tracks, user, artist)

  final_playlist_id = create_or_update_playlist(user, artist.name, playlist_id)
  update_playlist_content(user, final_playlist_id, filtered_tracks, artist.image_url)

  print(f"Playlist generated for artist: {artist.name}")

  return {
    "playlist_id": final_playlist_id,
    "artist_image_url": artist.image_url
  }

def collect_artist_tracks(artist, access_token):
  findings = []
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
  sorted_tracks = sort_tracks(tracks)

  tracks_to_add = []

  for track in sorted_tracks:
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

  filtered_tracks = remove_duplicate_tracks(tracks_to_add)
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
    tracks,
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
  findings.extend(filtered_tracks)
  return initial_size != len(findings)
