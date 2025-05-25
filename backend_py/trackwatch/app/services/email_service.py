from app.utils.email_helper import *
from app.clients.email.resend_client import send_email

def send_welcome_email(user):
  subject = generate_welcome_email_subject()
  html_body = generate_welcome_email_body(user)
  send_email(user, subject, html_body)

def send_added_tracks_email(user, added_tracks):
  if added_tracks:
    subject = generate_added_tracks_email_subject(added_tracks)
    html_body = generate_added_tracks_email_body(added_tracks)
    send_email(user, subject, html_body)
