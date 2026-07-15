import json
from unittest.mock import patch

from django.test import Client, SimpleTestCase


class UpdateNewReleasesViewTests(SimpleTestCase):
  def setUp(self):
    self.client = Client(enforce_csrf_checks=True)

  @patch("app.views.actions_view.threading.Thread")
  @patch("app.views.actions_view.config", return_value="admin-secret")
  def test_update_new_releases_accepts_admin_key_without_csrf_token(self, mock_config, mock_thread):
    response = self.client.post(
      "/actions/releases?daysLimit=7",
      HTTP_X_ADMIN_KEY="admin-secret",
    )

    self.assertEqual(response.status_code, 200)
    self.assertEqual(json.loads(response.content)["status"], "started")
    mock_thread.assert_called_once()
    self.assertEqual(mock_thread.call_args.kwargs["args"], (7,))
    self.assertTrue(mock_thread.call_args.kwargs["daemon"])
    mock_thread.return_value.start.assert_called_once()

  @patch("app.views.actions_view.threading.Thread")
  @patch("app.views.actions_view.config", return_value="admin-secret")
  def test_update_new_releases_rejects_invalid_admin_key_without_csrf_token(self, mock_config, mock_thread):
    response = self.client.post(
      "/actions/releases",
      HTTP_X_ADMIN_KEY="wrong-secret",
    )

    payload = json.loads(response.content)
    self.assertEqual(response.status_code, 403)
    self.assertEqual(payload["code"], "INVALID_ADMIN_CREDENTIALS")
    mock_thread.assert_not_called()

  @patch("app.views.actions_view.threading.Thread")
  @patch("app.views.actions_view.config", return_value=None)
  def test_update_new_releases_does_not_fall_back_to_django_secret_key(self, mock_config, mock_thread):
    response = self.client.post(
      "/actions/releases",
      HTTP_X_ADMIN_KEY="django-secret-key",
    )

    self.assertEqual(response.status_code, 403)
    mock_thread.assert_not_called()

  @patch("app.views.actions_view.threading.Thread")
  @patch("app.views.actions_view.config", return_value="admin-secret")
  def test_update_new_releases_rejects_out_of_range_days_limit(self, mock_config, mock_thread):
    response = self.client.post(
      "/actions/releases?daysLimit=1000000",
      HTTP_X_ADMIN_KEY="admin-secret",
    )

    payload = json.loads(response.content)
    self.assertEqual(response.status_code, 400)
    self.assertEqual(payload["code"], "INVALID_REQUEST_BODY")
    mock_thread.assert_not_called()
