import resend
from app.constants import AppInfo
from decouple import config
from app.exceptions import InternalServerErrorException, ErrorCode

resend.api_key = config("RESEND_API_KEY")

def send_email(recipient, email_subject, email_body):
  params = create_email_params(recipient, email_subject, email_body)
  try:
    resend.Emails.send(params)
  except Exception as e:
    print(f"Failed to send email: {str(e)}")
    raise InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, f"Failed to send email: {str(e)}")

def create_email_params(recipient, email_subject, email_body) -> resend.Emails.SendParams:
  email_from = generate_email_from(AppInfo.APP_NAME, AppInfo.DOMAIN)
  return {
    "from": email_from,
    "to": [recipient.email],
    "subject": email_subject,
    "html": email_body
  }

def generate_email_from(app_name, domain):
  subdomain = app_name.lower()
  return f"{app_name} <{subdomain}@{domain}>"
