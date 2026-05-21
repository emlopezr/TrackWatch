from django.test import RequestFactory, SimpleTestCase, override_settings

from app.exceptions import BadRequestException
from app.services.session_service import validate_spotify_redirect_uri


class SpotifyRedirectUriTests(SimpleTestCase):
  def setUp(self):
    self.factory = RequestFactory()

  @override_settings(CORS_ALLOWED_ORIGINS=["https://trackwatch.emlopezr.com"])
  def test_accepts_frontend_callback_origin(self):
    request = self.factory.get(
      "/auth/spotify/login",
      HTTP_X_FORWARDED_PROTO="https",
      HTTP_X_FORWARDED_HOST="trackwatch-api.emlopezr.com",
    )

    redirect_uri = validate_spotify_redirect_uri(
      request,
      "https://trackwatch.emlopezr.com/callback",
    )

    self.assertEqual(redirect_uri, "https://trackwatch.emlopezr.com/callback")

  @override_settings(CORS_ALLOWED_ORIGINS=["https://trackwatch.emlopezr.com"])
  def test_rejects_unknown_callback_origin(self):
    request = self.factory.get(
      "/auth/spotify/login",
      HTTP_X_FORWARDED_PROTO="https",
      HTTP_X_FORWARDED_HOST="trackwatch-api.emlopezr.com",
    )

    with self.assertRaises(BadRequestException):
      validate_spotify_redirect_uri(request, "https://evil.example/callback")

  @override_settings(CORS_ALLOWED_ORIGINS=["https://trackwatch.emlopezr.com"])
  def test_rejects_callback_with_extra_query_params(self):
    request = self.factory.get("/auth/spotify/login")

    with self.assertRaises(BadRequestException):
      validate_spotify_redirect_uri(
        request,
        "https://trackwatch.emlopezr.com/callback?next=https://evil.example",
      )
