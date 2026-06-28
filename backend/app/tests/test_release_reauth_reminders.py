import datetime
from unittest.mock import patch

from django.test import SimpleTestCase

from app.constants import System
from app.services.search_followed_releases_use_case import send_spotify_reauth_reminder_if_needed


class FakeUser:
  id = "spotify-user-id"
  email = "user@example.com"
  name = "TrackWatch User"
  current_refresh_token = "refresh-token"

  def __init__(self, authorized_at, notified_at=None):
    self.spotify_authorized_at = authorized_at
    self.spotify_reauth_notified_at = notified_at
    self.marked_notified = False

  def mark_spotify_reauth_notified(self):
    self.marked_notified = True
    self.spotify_reauth_notified_at = datetime.datetime.now(datetime.timezone.utc)


class SpotifyReauthReminderTests(SimpleTestCase):
  @patch("app.services.search_followed_releases_use_case.send_spotify_reauth_reminder_email")
  def test_sends_reminder_when_refresh_token_expires_within_window(self, send_email):
    authorized_at = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(
      days=System.SPOTIFY_REFRESH_TOKEN_LIFETIME_DAYS - 10,
    )
    user = FakeUser(authorized_at)

    send_spotify_reauth_reminder_if_needed(user)

    send_email.assert_called_once()
    self.assertEqual(send_email.call_args.args[0], user)
    self.assertEqual(send_email.call_args.args[2], 10)
    self.assertTrue(user.marked_notified)

  @patch("app.services.search_followed_releases_use_case.send_spotify_reauth_reminder_email")
  def test_does_not_send_reminder_before_window(self, send_email):
    authorized_at = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(
      days=System.SPOTIFY_REFRESH_TOKEN_LIFETIME_DAYS - System.SPOTIFY_REAUTH_REMINDER_DAYS - 1,
    )
    user = FakeUser(authorized_at)

    send_spotify_reauth_reminder_if_needed(user)

    send_email.assert_not_called()
    self.assertFalse(user.marked_notified)

  @patch("app.services.search_followed_releases_use_case.send_spotify_reauth_reminder_email")
  def test_does_not_repeat_reminder_when_user_was_already_notified(self, send_email):
    authorized_at = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(
      days=System.SPOTIFY_REFRESH_TOKEN_LIFETIME_DAYS,
    )
    notified_at = datetime.datetime.now(datetime.timezone.utc)
    user = FakeUser(authorized_at, notified_at)

    send_spotify_reauth_reminder_if_needed(user)

    send_email.assert_not_called()
    self.assertFalse(user.marked_notified)

  @patch("app.services.search_followed_releases_use_case.send_spotify_reauth_reminder_email")
  def test_email_failure_does_not_mark_user_as_notified(self, send_email):
    authorized_at = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(
      days=System.SPOTIFY_REFRESH_TOKEN_LIFETIME_DAYS,
    )
    user = FakeUser(authorized_at)
    send_email.side_effect = Exception("email provider unavailable")

    send_spotify_reauth_reminder_if_needed(user)

    send_email.assert_called_once()
    self.assertFalse(user.marked_notified)

  @patch("app.services.search_followed_releases_use_case.send_spotify_reauth_reminder_email")
  def test_disabled_email_does_not_mark_user_as_notified(self, send_email):
    authorized_at = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(
      days=System.SPOTIFY_REFRESH_TOKEN_LIFETIME_DAYS,
    )
    user = FakeUser(authorized_at)
    send_email.return_value = False

    send_spotify_reauth_reminder_if_needed(user)

    send_email.assert_called_once()
    self.assertFalse(user.marked_notified)
