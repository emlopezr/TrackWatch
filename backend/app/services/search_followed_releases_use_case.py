from app.constants import System
from .user_service import *
from .track_service import *
from .playlist_service import *
from .email_service import *
import datetime
import traceback
from app.classes.artist import Artist
from app.models.user_recently_added_track import UserRecentlyAddedTrack

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
  print(f"New releases update finished - {users_with_errors}/{total_users} users with errors")

  # if errors: send_admin_notification_email(total_users, errors)
  send_admin_notification_email(total_users, errors)

def update_user_new_releases(user, days_limit: int = System.FILTER_DAYS_LIMIT):
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

def find_new_releases_for_user(user, access_token, days_limit: int):
  new_releases = []

  for followed_artist in user.followed_artists.all():
    artist = Artist(followed_artist.artist_id, followed_artist.artist_name)
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
