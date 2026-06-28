import requests
from django.test import SimpleTestCase
from unittest.mock import patch

from app.clients.spotify.spotify_auth_api_client import (
  refresh_access_token,
  refresh_access_token_with_retries,
  map_to_spotify_token_dto,
)
from app.exceptions import ErrorCode, SpotifyReauthorizationRequiredException


def _http_error(status_code, payload):
  response = requests.Response()
  response.status_code = status_code
  response._content = payload.encode("utf-8")
  response.headers["Content-Type"] = "application/json"
  return requests.HTTPError(response=response)


class SpotifyAuthApiClientTests(SimpleTestCase):
  @patch("app.clients.spotify.spotify_auth_api_client.config", side_effect=["client-id", "client-secret"])
  @patch("app.clients.spotify.spotify_auth_api_client.spotify_auth_request")
  def test_refresh_access_token_maps_invalid_grant_to_reauthorization_required(self, spotify_auth_request, mock_config):
    spotify_auth_request.side_effect = _http_error(400, '{"error":"invalid_grant"}')

    with self.assertRaises(SpotifyReauthorizationRequiredException) as context:
      refresh_access_token("expired-refresh-token")

    self.assertEqual(context.exception.error_code, ErrorCode.SPOTIFY_REAUTH_REQUIRED)
    spotify_auth_request.assert_called_once()

  @patch("app.clients.spotify.spotify_auth_api_client.refresh_access_token")
  def test_refresh_access_token_with_retries_does_not_retry_reauthorization_required(self, refresh_access_token_mock):
    refresh_access_token_mock.side_effect = SpotifyReauthorizationRequiredException(
      ErrorCode.SPOTIFY_REAUTH_REQUIRED,
    )

    with self.assertRaises(SpotifyReauthorizationRequiredException):
      refresh_access_token_with_retries("expired-refresh-token")

    refresh_access_token_mock.assert_called_once_with("expired-refresh-token")

  def test_map_to_spotify_token_dto_uses_rotated_refresh_token_when_present(self):
    tokens = map_to_spotify_token_dto(
      {
        "access_token": "new-access-token",
        "refresh_token": "rotated-refresh-token",
      },
      "old-refresh-token",
    )

    self.assertEqual(tokens["access_token"], "new-access-token")
    self.assertEqual(tokens["refresh_token"], "rotated-refresh-token")

  def test_map_to_spotify_token_dto_keeps_existing_refresh_token_when_missing(self):
    tokens = map_to_spotify_token_dto(
      {"access_token": "new-access-token"},
      "existing-refresh-token",
    )

    self.assertEqual(tokens["refresh_token"], "existing-refresh-token")
