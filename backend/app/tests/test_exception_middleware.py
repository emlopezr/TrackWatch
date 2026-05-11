import json

from django.test import RequestFactory, SimpleTestCase, override_settings

from app.exceptions.exceptions import BadRequestException, ErrorCode, InternalServerErrorException
from app.exceptions.middleware import GlobalExceptionMiddleware


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
