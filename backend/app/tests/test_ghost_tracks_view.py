import json
from unittest.mock import patch

from django.test import Client, SimpleTestCase, override_settings

from app.exceptions import ErrorCode, SpotifyReauthorizationRequiredException


class FakeSession(dict):
  def __init__(self):
    super().__init__({"trackwatch_user_id": "spotify-user-id"})
    self.flushed = False

  def flush(self):
    self.flushed = True
    self.clear()


class FakeUser:
  id = "spotify-user-id"


class GhostTracksViewReauthorizationTests(SimpleTestCase):
  def setUp(self):
    self.client = Client()

  @override_settings(DEBUG=False, SESSION_ENGINE="django.contrib.sessions.backends.signed_cookies")
  @patch("app.views.ghost_tracks_view.get_session_user", return_value=FakeUser())
  @patch("app.views.ghost_tracks_view.with_user_access_token")
  def test_get_playlists_preserves_spotify_reauthorization_required(self, with_token, get_user):
    with_token.side_effect = SpotifyReauthorizationRequiredException(ErrorCode.SPOTIFY_REAUTH_REQUIRED)

    response = self.client.get("/ghost-tracks/playlists")

    payload = json.loads(response.content)
    self.assertEqual(response.status_code, 401)
    self.assertEqual(payload["code"], "SPOTIFY_REAUTH_REQUIRED")
