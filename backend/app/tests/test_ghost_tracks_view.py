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
  is_authenticated = True


class GhostTracksViewReauthorizationTests(SimpleTestCase):
  def setUp(self):
    self.client = Client()

  @override_settings(DEBUG=False, SESSION_ENGINE="django.contrib.sessions.backends.signed_cookies")
  @patch("app.authentication.get_session_user", return_value=FakeUser())
  @patch("app.views.ghost_tracks_view.with_user_access_token")
  def test_get_playlists_preserves_spotify_reauthorization_required(self, with_token, get_user):
    with_token.side_effect = SpotifyReauthorizationRequiredException(ErrorCode.SPOTIFY_REAUTH_REQUIRED)

    response = self.client.get("/ghost-tracks/playlists")

    payload = json.loads(response.content)
    self.assertEqual(response.status_code, 401)
    self.assertEqual(payload["code"], "SPOTIFY_REAUTH_REQUIRED")


class GhostTracksViewSecurityTests(SimpleTestCase):
  PLAYLIST_ID = "A" * 22
  OTHER_PLAYLIST_ID = "B" * 22
  TRACK_URI = f"spotify:track:{'C' * 22}"

  def setUp(self):
    self.client = Client(enforce_csrf_checks=True)

  @patch("app.authentication.get_session_user", return_value=FakeUser())
  def test_scan_requires_csrf_token(self, get_user):
    response = self.client.post(
      "/ghost-tracks/scan",
      data=json.dumps({"playlistIds": [self.PLAYLIST_ID]}),
      content_type="application/json",
    )

    self.assertEqual(response.status_code, 403)

  @patch("app.authentication.get_session_user", return_value=FakeUser())
  def test_remove_requires_csrf_token(self, get_user):
    response = self.client.post(
      "/ghost-tracks/remove",
      data=json.dumps({
        "removals": [{"playlistId": self.PLAYLIST_ID, "trackUris": [self.TRACK_URI]}],
      }),
      content_type="application/json",
    )

    self.assertEqual(response.status_code, 403)

  @patch("app.views.ghost_tracks_view.get_owned_playlists")
  @patch("app.authentication.get_session_user", return_value=FakeUser())
  @patch("app.views.ghost_tracks_view.with_user_access_token")
  def test_scan_rejects_playlist_not_owned_by_session_user(self, with_token, get_user, get_owned):
    with_token.side_effect = lambda user, callback: callback("token")
    get_owned.return_value = [{"id": self.PLAYLIST_ID, "name": "Owned"}]
    client = Client(enforce_csrf_checks=False)

    response = client.post(
      "/ghost-tracks/scan",
      data=json.dumps({"playlistIds": [self.OTHER_PLAYLIST_ID]}),
      content_type="application/json",
    )

    payload = json.loads(response.content)
    self.assertEqual(response.status_code, 403)
    self.assertEqual(payload["code"], "PLAYLIST_ACCESS_DENIED")

  @patch("app.authentication.get_session_user", return_value=FakeUser())
  def test_scan_rejects_malformed_playlist_id(self, get_user):
    client = Client(enforce_csrf_checks=False)

    response = client.post(
      "/ghost-tracks/scan",
      data=json.dumps({"playlistIds": ["../not-a-spotify-id"]}),
      content_type="application/json",
    )

    payload = json.loads(response.content)
    self.assertEqual(response.status_code, 400)
    self.assertEqual(payload["code"], "INVALID_REQUEST_BODY")
