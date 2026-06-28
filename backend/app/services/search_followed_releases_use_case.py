from app.constants import System
from .user_service import *
from .track_service import *
from .playlist_service import *
from .email_service import *
import datetime
import traceback
from app.models.user_recently_added_track import UserRecentlyAddedTrack
from app.clients.spotify import get_followed_artists

def update_new_releases_for_all_users(days_limit: int = System.FILTER_DAYS_LIMIT):
  users = get_all_users()
  errors = {}
  total_users = len(users)

  print(f"Running new releases update for {total_users} users")
  for user in users:
    if hasattr(user, "updates_enabled") and not user.updates_enabled:
      continue

    try:
      update_user_new_releases(user, days_limit)
    except Exception as e:
      error_msg = f"Error while updating new releases for user {user.id}: {str(e)}\n{traceback.format_exc()}"
      print(error_msg)
      errors[user.id] = error_msg

  users_with_errors = len(errors)
  ok_users = total_users - users_with_errors
  print(f"New releases update finished - {users_with_errors}/{total_users} users with errors")

  if users_with_errors == 0:
    status = "ok"
  elif users_with_errors == total_users:
    status = "error"
  else:
    status = "partial_error"

  result = {
    "status": status,
    "message": "New releases update completed successfully" if users_with_errors == 0 else f"Completed with {users_with_errors} errors",
    "ok_users_count": ok_users,
    "error_users_count": users_with_errors,
    "errors": list(errors.values()) if users_with_errors > 0 else []
  }
  return result

def update_user_new_releases(user, days_limit: int = System.FILTER_DAYS_LIMIT):
  send_spotify_reauth_reminder_if_needed(user)
  active_user = get_user_with_valid_token(user)
  access_token = getattr(active_user, "current_access_token", None)

  new_release_tracks = find_new_releases_for_user(active_user, access_token, days_limit)
  filtered_tracks = remove_duplicate_tracks(new_release_tracks)

  added_tracks = update_new_releases_playlist(active_user, filtered_tracks)
  update_user_recently_added_tracks(active_user, added_tracks)

  active_user.save_user()
  send_added_tracks_email(user, added_tracks)

def get_user_with_valid_token(user):
  return get_valid_access_token(user)

def send_spotify_reauth_reminder_if_needed(user):
  if not user.current_refresh_token or not user.spotify_authorized_at:
    return

  expires_at = user.spotify_authorized_at + datetime.timedelta(days=System.SPOTIFY_REFRESH_TOKEN_LIFETIME_DAYS)
  reminder_at = expires_at - datetime.timedelta(days=System.SPOTIFY_REAUTH_REMINDER_DAYS)
  now = datetime.datetime.now(datetime.timezone.utc)

  if now < reminder_at or user.spotify_reauth_notified_at:
    return

  days_remaining = max((expires_at.date() - now.date()).days, 0)
  try:
    sent = send_spotify_reauth_reminder_email(user, expires_at, days_remaining)
    if sent:
      user.mark_spotify_reauth_notified()
  except Exception as e:
    print(f"Failed to send Spotify reauthorization reminder for user {user.id}: {str(e)}")

def find_new_releases_for_user(user, access_token, days_limit: int):
  new_releases = []

  # Get followed artists from Spotify API instead of local database
  followed_artists = get_followed_artists(access_token)
  for artist in followed_artists:
    collect_artist_tracks(user, artist, access_token, new_releases, days_limit)

  return list(sort_tracks(new_releases))

def collect_artist_tracks(user, artist, access_token, user_added_tracks, days_limit):
  artist_new_tracks = search_artist_tracks(
    artist,
    access_token,
    System.PAGES_TO_FETCH,
    days_limit
  )
  for track in artist_new_tracks:
    filter_track(
      track,
      user,
      artist,
      user_added_tracks,
      days_limit,
      should_check_track_recently_added=True
    )

def update_new_releases_playlist(user, tracks):
  check_and_create_playlist_if_needed(user)
  return list(add_tracks_to_playlist(user, user.playlist_id, tracks))

def update_user_recently_added_tracks(user, added_tracks):
  for track in added_tracks:
    track_data = track.to_persisted_track()

    UserRecentlyAddedTrack.objects.create(
      user=user,
      track_id=track_data["track_id"],
      track_name=track_data["track_name"],
      track_added_at=track_data.get("track_added_at", datetime.datetime.now(datetime.timezone.utc))
    )

  cleanup_old_tracks(user)

def cleanup_old_tracks(user):
  now = datetime.datetime.now(datetime.timezone.utc)
  max_date = now - datetime.timedelta(days=System.CLEANUP_DAYS_LIMIT)
  UserRecentlyAddedTrack.objects.filter(
    user=user,
    track_added_at__lt=max_date
  ).delete()
