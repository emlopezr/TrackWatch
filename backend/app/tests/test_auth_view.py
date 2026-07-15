import json
from unittest.mock import Mock, patch

from django.test import RequestFactory, SimpleTestCase

from app.constants import Spotify
from app.views.auth_view import spotify_exchange


class SpotifyExchangeSecurityTests(SimpleTestCase):
  def setUp(self):
    self.factory = RequestFactory()

  @patch("app.views.auth_view.spotify_auth_raw_request")
  def test_oauth_state_is_consumed_before_upstream_exchange(self, spotify_request):
    spotify_request.return_value = Mock(status_code=400)
    spotify_request.return_value.json.return_value = {"error": "invalid_grant"}
    request = self.factory.post(
      "/auth/spotify/exchange",
      data=json.dumps({"code": "spotify-code", "state": "oauth-state"}),
      content_type="application/json",
    )
    request.session = {
      Spotify.OAUTH_STATE_KEY: "oauth-state",
      Spotify.OAUTH_REDIRECT_URI_KEY: "https://trackwatch.emlopezr.com/callback",
    }

    response = spotify_exchange(request)

    self.assertEqual(response.status_code, 400)
    self.assertNotIn(Spotify.OAUTH_STATE_KEY, request.session)
