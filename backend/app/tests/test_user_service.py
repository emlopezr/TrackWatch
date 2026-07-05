from django.test import SimpleTestCase
from django.utils import timezone
from unittest.mock import patch

from app.exceptions import ErrorCode, SpotifyReauthorizationRequiredException
from app.models import User
from app.services.user_service import get_valid_access_token


class FakeUser:
  current_refresh_token = "expired-refresh-token"

  def __init__(self):
    self.cleared = False

  def clear_spotify_tokens(self):
    self.cleared = True


class UserServiceTokenTests(SimpleTestCase):
  @patch("app.services.user_service.refresh_access_token_with_retries")
  def test_get_valid_access_token_clears_tokens_before_raising_reauthorization_required(self, refresh_mock):
    user = FakeUser()
    refresh_mock.side_effect = SpotifyReauthorizationRequiredException(
      ErrorCode.SPOTIFY_REAUTH_REQUIRED,
    )

    with self.assertRaises(SpotifyReauthorizationRequiredException):
      get_valid_access_token(user)

    self.assertTrue(user.cleared)

  def test_clear_spotify_tokens_discards_current_and_previous_tokens(self):
    user = User(
      id="spotify-user-id",
      email="user@example.com",
      name="User",
      current_access_token="current-access-token",
      current_refresh_token="current-refresh-token",
      last_access_token="last-access-token",
      last_refresh_token="last-refresh-token",
    )
    save_kwargs = {}

    def fake_save(*args, **kwargs):
      save_kwargs.update(kwargs)

    user.save = fake_save
    user.clear_spotify_tokens()

    self.assertEqual(user.current_access_token, "")
    self.assertEqual(user.current_refresh_token, "")
    self.assertEqual(user.last_access_token, "")
    self.assertEqual(user.last_refresh_token, "")
    self.assertEqual(
      save_kwargs["update_fields"],
      [
        "last_access_token",
        "last_refresh_token",
        "current_access_token",
        "current_refresh_token",
      ],
    )

  def test_update_tokens_from_authorization_resets_reauth_notification(self):
    user = User(
      id="spotify-user-id",
      email="user@example.com",
      name="User",
      current_access_token="old-access-token",
      current_refresh_token="old-refresh-token",
      spotify_reauth_notified_at=timezone.now(),
    )

    user.save = lambda *args, **kwargs: None
    user.update_tokens_from_authorization("new-access-token", "new-refresh-token")

    self.assertEqual(user.last_access_token, "old-access-token")
    self.assertEqual(user.last_refresh_token, "old-refresh-token")
    self.assertEqual(user.current_access_token, "new-access-token")
    self.assertEqual(user.current_refresh_token, "new-refresh-token")
    self.assertIsNotNone(user.spotify_authorized_at)
    self.assertIsNone(user.spotify_reauth_notified_at)
