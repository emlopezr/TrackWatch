import datetime
import pytz
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
  tracks_to_add,
  days_limit: int = System.FILTER_DAYS_LIMIT,
  should_check_correct_artist: bool = True,
  should_check_track_in_time_range: bool = True,
  should_check_compilation_album: bool = True,
  should_check_song_blocked_by_user_settings: bool = True,
  should_check_track_recently_added: bool = False
):
  tz = pytz.timezone(System.SERVER_TIMEZONE)
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
    tracks_to_add.append(selected_track)
    return selected_track

  return None

def sort_tracks(tracks) -> list:
  sorted_list = sorted(
    tracks,
    key=lambda t: (
      t.release_date,
      t.album_name,
      t.disc_number,
      t.album_order
    )
  )

  return sorted_list

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
  # Ensure track.release_date is timezone-aware
  if track.release_date.tzinfo is None:
    track.release_date = pytz.timezone(System.SERVER_TIMEZONE).localize(track.release_date)

  return start_date <= track.release_date <= end_date

def is_compilation_album(track) -> bool:
  return getattr(track, "album_type", "") == "compilation"

def is_song_blocked_by_user_settings(track, user) -> bool:
  return user.setting_blocked_explicit_content and track.is_explicit

def get_track_selection_rule(track, equal_track):
    rules = [
      {
        'condition': lambda t, et: t.album_type == "single" and et.album_type == "album",
        'select': lambda t, et: (et, t, "album version")
      },
      {
        'condition': lambda t, et: t.album_type == "album" and et.album_type == "single",
        'select': lambda t, et: (t, et, "album version")
      },
      # Prefer explicit version
      {
        'condition': lambda t, et: not t.is_explicit and et.is_explicit,
        'select': lambda t, et: (et, t, "explicit version")
      },
      {
        'condition': lambda t, et: not et.is_explicit and t.is_explicit,
        'select': lambda t, et: (t, et, "explicit version")
      }
    ]

    for rule in rules:
      if rule['condition'](track, equal_track):
        return rule['select'](track, equal_track)

    return equal_track, track, "existing version"

def select_track(track, tracks_to_add):
    equal_tracks = [t for t in tracks_to_add if t.is_equal_to(track)]
    equal_track = equal_tracks[0] if equal_tracks else None
    if equal_track is None:
        return track

    selected_track, non_selected_track, reason = get_track_selection_rule(track, equal_track)

    if reason != "existing version":
      print(f"Track {selected_track.name} from {selected_track.album_name} replaced the {reason} of this track")

    if non_selected_track in tracks_to_add:
      tracks_to_add.remove(non_selected_track)

    return selected_track

def find_equal_track_in_list(track, tracks) -> bool:
  return next((t for t in tracks if t.is_equal_strict(track)), None)

def is_same_track_in_list(track, tracks) -> bool:
  return any(t.is_equal_strict(track) for t in tracks)

def is_track_recently_added(user, track) -> bool:
  recently_added = user.recently_added_tracks.all()
  return any(track.is_equal_to_track(t) for t in recently_added)
