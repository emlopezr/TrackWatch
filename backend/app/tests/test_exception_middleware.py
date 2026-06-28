import json

from django.test import RequestFactory, SimpleTestCase, override_settings

from app.exceptions.exceptions import (
  BadRequestException,
  ErrorCode,
  InternalServerErrorException,
  SpotifyReauthorizationRequiredException,
)
from app.exceptions.middleware import GlobalExceptionMiddleware


class FakeSession(dict):
  def __init__(self):
    super().__init__({"trackwatch_user_id": "spotify-user-id"})
    self.flushed = False

  def flush(self):
    self.flushed = True
    self.clear()


class GlobalExceptionMiddlewareTests(SimpleTestCase):
  def setUp(self):
    self.factory = RequestFactory()
    self.middleware = GlobalExceptionMiddleware(lambda request: None)

  @override_settings(DEBUG=False)
  def test_internal_server_errors_hide_details_in_production(self):
    request = self.factory.get("/users/me")

    response = self.middleware.process_exception(
      request,
      InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, details="db connection failed"),
    )

    payload = json.loads(response.content)
    self.assertEqual(response.status_code, 500)
    self.assertEqual(payload["details"], "")
    self.assertNotIn("stack_trace", payload)

  @override_settings(DEBUG=False)
  def test_bad_request_errors_keep_details(self):
    request = self.factory.get("/users/me")

    response = self.middleware.process_exception(
      request,
      BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="missing field"),
    )

    payload = json.loads(response.content)
    self.assertEqual(response.status_code, 400)
    self.assertEqual(payload["details"], "missing field")

  @override_settings(DEBUG=False)
  def test_spotify_reauthorization_required_flushes_session(self):
    request = self.factory.get("/users/me")
    request.session = FakeSession()

    response = self.middleware.process_exception(
      request,
      SpotifyReauthorizationRequiredException(ErrorCode.SPOTIFY_REAUTH_REQUIRED),
    )

    payload = json.loads(response.content)
    self.assertEqual(response.status_code, 401)
    self.assertEqual(payload["code"], "SPOTIFY_REAUTH_REQUIRED")
    self.assertTrue(request.session.flushed)
    self.assertEqual(dict(request.session), {})
