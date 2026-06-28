from app.utils.email_helper import *
from app.clients.email.resend_client import send_email, send_admin_email
from decouple import config

def send_welcome_email(user):
  subject = generate_welcome_email_subject()
  html_body = generate_welcome_email_body(user)
  return send_email(user, subject, html_body)

def send_added_tracks_email(user, added_tracks):
  if added_tracks:
    subject = generate_added_tracks_email_subject(added_tracks)
    html_body = generate_added_tracks_email_body(added_tracks)
    return send_email(user, subject, html_body)
  return False

def send_spotify_reauth_reminder_email(user, expires_at, days_remaining):
  subject = generate_spotify_reauth_reminder_email_subject(days_remaining)
  html_body = generate_spotify_reauth_reminder_email_body(user, expires_at, days_remaining)
  return send_email(user, subject, html_body)

def send_admin_notification_email(users_count, errors=None):
  admin_email = config('ADMIN_EMAIL', default=None)

  if not admin_email:
    print("ADMIN_EMAIL environment variable not set")
    return

  subject = generate_admin_notification_email_subject()
  html_body = generate_admin_notification_email_body(users_count, errors)

  return send_admin_email(admin_email, subject, html_body)
