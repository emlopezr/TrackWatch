from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication, CSRFCheck

from app.services.session_service import get_session_user


def _dummy_get_response(request):
  return None


class TrackWatchSessionAuthentication(BaseAuthentication):
  """Authenticate TrackWatch's Spotify-backed session and enforce CSRF."""

  def authenticate(self, request):
    user = get_session_user(request)
    self.enforce_csrf(request)
    return user, None

  def enforce_csrf(self, request):
    check = CSRFCheck(_dummy_get_response)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
      raise exceptions.PermissionDenied(f"CSRF Failed: {reason}")
