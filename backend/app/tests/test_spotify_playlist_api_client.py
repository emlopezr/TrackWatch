from types import SimpleNamespace
from unittest.mock import call, patch

from django.test import SimpleTestCase

from app.clients.spotify.spotify_playlist_api_client import filter_saved_tracks


class FilterSavedTracksTests(SimpleTestCase):
  def test_filter_saved_tracks_chunks_library_contains_requests_at_40_uris(self):
    user = SimpleNamespace(current_access_token="access-token")
    uris = [f"spotify:track:{index}" for index in range(41)]

    with patch(
      "app.clients.spotify.spotify_playlist_api_client.spotify_api_request",
      side_effect=[[False] * 40, [False]],
    ) as spotify_api_request:
      filtered_uris = filter_saved_tracks(user, uris)

    self.assertEqual(filtered_uris, uris)
    self.assertEqual(spotify_api_request.call_count, 2)
    spotify_api_request.assert_has_calls([
      call(
        method="GET",
        endpoint="/me/library/contains",
        token="access-token",
        params={"uris": ",".join(uris[:40])},
      ),
      call(
        method="GET",
        endpoint="/me/library/contains",
        token="access-token",
        params={"uris": uris[40]},
      ),
    ])

  def test_filter_saved_tracks_removes_uris_already_saved_by_user(self):
    user = SimpleNamespace(current_access_token="access-token")
    uris = ["spotify:track:1", "spotify:track:2", "spotify:track:3"]

    with patch(
      "app.clients.spotify.spotify_playlist_api_client.spotify_api_request",
      return_value=[False, True, False],
    ):
      filtered_uris = filter_saved_tracks(user, uris)

    self.assertEqual(filtered_uris, ["spotify:track:1", "spotify:track:3"])
