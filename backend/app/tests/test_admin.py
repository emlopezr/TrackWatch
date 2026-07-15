from django.contrib import admin
from django.test import SimpleTestCase

from app.admin import UserAdmin
from app.models import User


class UserAdminSecurityTests(SimpleTestCase):
  def test_sensitive_credentials_are_excluded(self):
    user_admin = UserAdmin(User, admin.site)

    excluded = set(user_admin.get_exclude(request=None))

    self.assertTrue({
      "password",
      "current_access_token",
      "current_refresh_token",
      "last_access_token",
      "last_refresh_token",
    }.issubset(excluded))
