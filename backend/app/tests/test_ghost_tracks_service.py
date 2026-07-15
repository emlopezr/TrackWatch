from unittest.mock import patch

from django.test import SimpleTestCase

from app.services.ghost_tracks_service import scan_playlist_for_ghost_tracks


class GhostTracksServiceSecurityTests(SimpleTestCase):
  @patch("app.services.ghost_tracks_service.get_playlist_tracks_with_market")
  def test_scan_error_does_not_expose_upstream_details(self, get_tracks):
    get_tracks.side_effect = RuntimeError("secret upstream response")

    result = scan_playlist_for_ghost_tracks("token", "A" * 22, "Playlist", "CO")

    self.assertEqual(result["error"], "Unable to scan playlist")
    self.assertNotIn("secret", result["error"])
