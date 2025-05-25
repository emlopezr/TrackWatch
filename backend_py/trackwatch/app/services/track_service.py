import datetime
from app.constants import System
from app.clients.spotify.spotify_artist_api_client import search_artist_tracks_with_retries

def search_artist_tracks(
  artist,
  access_token: str,
  pages_to_fetch: int,
  days_limit: int = System.FILTER_DAYS_LIMIT
) -> list:
  new_tracks = []

  for page in range(pages_to_fetch):
    page_new_tracks = search_artist_tracks_with_retries(
      artist,
      access_token,
      days_limit,
      page
    )
    new_tracks.extend(page_new_tracks)

  return new_tracks

def filter_track(
  track,
  user,
  artist,
  tracks_to_add: set,
  days_limit: int = System.FILTER_DAYS_LIMIT,
  should_check_correct_artist: bool = True,
  should_check_track_in_time_range: bool = True,
  should_check_compilation_album: bool = True,
  should_check_song_blocked_by_user_settings: bool = True,
  should_check_track_recently_added: bool = False
):
  tz = datetime.timezone(datetime.timedelta(hours=int(System.SERVER_TIMEZONE)))
  today = datetime.datetime.now(tz)
  start_date = today - datetime.timedelta(days=days_limit)

  is_correct_artist_result = (not should_check_correct_artist) or is_correct_artist(track, artist)
  is_track_in_time_range_result = (not should_check_track_in_time_range) or is_track_in_time_range(track, start_date, today)
  is_compilation_album_result = should_check_compilation_album and is_compilation_album(track)
  is_song_blocked_result = should_check_song_blocked_by_user_settings and is_song_blocked_by_user_settings(track, user)
  is_track_recently_added_result = should_check_track_recently_added and is_track_recently_added(user, track)

  if (
    is_correct_artist_result and
    is_track_in_time_range_result and
    not is_compilation_album_result and
    not is_song_blocked_result and
    not is_track_recently_added_result
  ):
    selected_track = select_track(track, tracks_to_add)
    if is_same_track_in_list(selected_track, tracks_to_add): return None
    tracks_to_add.add(selected_track)
    return selected_track

  return None

def sort_tracks(tracks: set) -> set:
  sorted_list = sorted(
    tracks,
    key=lambda t: (
      t.release_date,
      t.album_name,
      t.disc_number,
      t.album_order
    )
  )
  return set(sorted_list)

def remove_duplicate_tracks(tracks: list) -> list:
  unique_tracks = []
  processed_tracks = {}

  for track in tracks:
    base_signature = generate_track_signature_without_duration(track)

    if base_signature in processed_tracks:
      existing_track = processed_tracks[base_signature]
      duration_difference = abs(track.duration_ms - existing_track.duration_ms)

      if duration_difference > 1000:
        unique_signature = f"{base_signature}|{track.duration_ms}"
        processed_tracks[unique_signature] = track
        unique_tracks.append(track)

    else:
      processed_tracks[base_signature] = track
      unique_tracks.append(track)

  return unique_tracks

def generate_track_signature_without_duration(track) -> str:
  normalized_name = track.name.lower()
  artists_signature = ",".join(sorted([a.name.lower() for a in track.artists]))
  return f"{normalized_name}|{artists_signature}"

def is_correct_artist(track, artist) -> bool:
  return any(a.id == artist.id for a in track.artists)

def is_track_in_time_range(track, start_date, end_date) -> bool:
  return start_date <= track.release_date <= end_date

def is_compilation_album(track) -> bool:
  return getattr(track, "album_type", "") == "compilation"

def is_song_blocked_by_user_settings(track, user) -> bool:
  blocked = getattr(user, "settings", None)
  if blocked: return getattr(blocked, "blocked_explicit_content", False) and track.is_explicit

  return user.settings.get("blocked_explicit_content", False) and track.is_explicit

def select_track(track, tracks_to_add: set):
  equal_track = next((t for t in tracks_to_add if t.is_equal_to(track)), None)
  if equal_track is None: return track

  selected_track = track
  non_selected_track = equal_track

  if selected_track.album_type == "single" and equal_track.album_type == "album":
    selected_track = equal_track
    non_selected_track = track

  if not selected_track.is_explicit and non_selected_track.is_explicit:
    selected_track = non_selected_track

  return selected_track

def is_same_track_in_list(track, tracks: set) -> bool:
  return any(t.is_equal_strict(track) for t in tracks)

def is_track_recently_added(user, track) -> bool:
  recently_added = getattr(user, "recently_added_tracks", [])
  return any(t.is_equal_to(track) for t in recently_added)
