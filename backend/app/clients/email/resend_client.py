import resend
from app.constants import AppInfo
from decouple import config
from app.exceptions import InternalServerErrorException, ErrorCode
from app.models.user import User

def _configure_api_key():
  api_key = config("RESEND_API_KEY", default="")
  if not api_key: return False
  resend.api_key = api_key
  return True

def send_admin_email(admin_email, email_subject, email_body):
  if not _configure_api_key(): return
  params = create_email_params(admin_email, email_subject, email_body)

  try:
    resend.Emails.send(params)
  except Exception as e:
    print(f"Failed to send admin email: {str(e)}")

def send_email(recipient, email_subject, email_body):
  if not _configure_api_key(): return
  params = create_email_params(recipient, email_subject, email_body)

  try:
    resend.Emails.send(params)
  except Exception as e:
    print(f"Failed to send email: {str(e)}")
    raise InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, f"Failed to send email: {str(e)}")

def create_email_params(recipient, email_subject, email_body) -> resend.Emails.SendParams:
  email_from = generate_email_from(AppInfo.APP_NAME, AppInfo.DOMAIN)
  email_to = [recipient.email if isinstance(recipient, User) else recipient]

  return {
    "from": email_from,
    "to": email_to,
    "subject": email_subject,
    "html": email_body
  }

def generate_email_from(app_name, domain):
  subdomain = app_name.lower()
  return f"{app_name} <{subdomain}@{domain}>"
