from app.constants import AppInfo, Colors, Assets
import datetime
import logging

logger = logging.getLogger(__name__)

MAX_ARTISTS_IN_SUBJECT = 3


def generate_welcome_email_subject():
    return f"Welcome to {AppInfo.APP_NAME}"


def generate_added_tracks_email_subject(user_added_tracks):
    """
    Generate a dynamic subject line with artist names.
    Format: [TrackWatch] New releases for you: Artist1, Artist2, Artist3...
    """
    unique_artists = []
    seen_artists = set()

    for track in user_added_tracks:
        for artist in track.artists:
            if artist.name not in seen_artists:
                seen_artists.add(artist.name)
                unique_artists.append(artist.name)

    if not unique_artists:
        return f"[{AppInfo.APP_NAME}] New releases for you"

    if len(unique_artists) <= MAX_ARTISTS_IN_SUBJECT:
        artists_str = ", ".join(unique_artists)
    else:
        artists_str = ", ".join(
            unique_artists[:MAX_ARTISTS_IN_SUBJECT]) + "..."

    return f"[{AppInfo.APP_NAME}] New releases for you: {artists_str}"


def generate_welcome_email_body(user):
    year = generate_current_year()

    return f"""\
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: Arial, sans-serif; background-color: {Colors.LIGHT_GRAY_1}; color: {Colors.DARK_GRAY}; }}
    .email-container {{ max-width: 600px; margin: 20px auto; background-color: {Colors.WHITE}; border-radius: 8px; border: 1px solid {Colors.LIGHT_GRAY_3}; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }}
    .header {{ background-color: {Colors.GREEN}; color: {Colors.WHITE}; text-align: center; padding: 20px; font-size: 20px; font-weight: bold; }}
    .header-subtitle {{ font-size: 12px; font-weight: normal; }}
    .content {{ padding: 20px; }}
    .footer {{ background-color: {Colors.LIGHT_GRAY_2}; color: #666; text-align: center; padding: 10px; font-size: 12px; }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      Welcome to {AppInfo.APP_NAME}
      <div class="header-subtitle">Thanks for joining us</div>
    </div>
    <div class="content">
      <p>Hi {user.name},</p>
      <p>Thanks for signing up for {AppInfo.APP_NAME}.</p>
      <p>You'll now stay updated on new releases from your favorite artists automatically.</p>
      <p>Follow your favorite artists to get their latest tracks added to your playlist and receive notifications.</p>
      <p>Enjoy the music.</p>
    </div>
    <div class="footer">
      © {year} {AppInfo.APP_NAME} · Developed by <a href="{AppInfo.GITHUB_USER_PROFILE}" style="color: {Colors.GREEN}; text-decoration: none;">@{AppInfo.DEVELOPER}</a>
    </div>
  </div>
</body>
</html>
"""


def generate_added_tracks_email_body(user_added_tracks):
    today = generate_today_date()
    year = generate_current_year()
    tracks_html = ""

    for track in user_added_tracks:
        image = track.album_images[0].url if track.album_images else Assets.DEFAULT_TRACK_IMAGE_URL
        artists = ", ".join([a.name for a in track.artists])
        tracks_html += f"""
      <tr>
        <td style="text-align: center;">
          <img src="{image}" alt="{track.name}" style="border-radius: 8px; width: 50px; height: 50px;">
        </td>
        <td>
          <strong>{track.name}</strong><br>
          <small>{artists}</small>
        </td>
      </tr>
    """

    header_title = (
        "New release available" if len(user_added_tracks) == 1
        else f"{len(user_added_tracks)} new releases available"
    )

    content_msg = (
        "<p><strong>1 new track</strong> has been added to your playlist:</p>" if len(user_added_tracks) == 1
        else f"<p><strong>{len(user_added_tracks)} new tracks</strong> have been added to your playlist:</p>"
    )

    return f"""\
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: Arial, sans-serif; background-color: {Colors.LIGHT_GRAY_1}; color: {Colors.DARK_GRAY}; }}
    .email-container {{ max-width: 600px; margin: 20px auto; background-color: {Colors.WHITE}; border-radius: 8px; border: 1px solid {Colors.LIGHT_GRAY_3}; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }}
    .header {{ background-color: {Colors.GREEN}; color: {Colors.WHITE}; text-align: center; padding: 20px; font-size: 20px; font-weight: bold; }}
    .header-subtitle {{ font-size: 12px; font-weight: normal; }}
    .content {{ padding: 20px; }}
    table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
    th, td {{ padding: 10px; border: 1px solid {Colors.LIGHT_GRAY_3}; }}
    th {{ background-color: {Colors.LIGHT_GRAY_2}; text-align: center; }}
    .footer {{ background-color: {Colors.LIGHT_GRAY_2}; color: #666; text-align: center; padding: 10px; font-size: 12px; }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      {header_title}
      <div class="header-subtitle">{today}</div>
    </div>
    <div class="content">
      {content_msg}
      <table>
        <tbody>
          {tracks_html}
        </tbody>
      </table>
      <p style="margin-top: 20px;">Listen on Spotify to enjoy your new releases.</p>
    </div>
    <div class="footer">
      © {year} {AppInfo.APP_NAME} · Developed by <a href="{AppInfo.GITHUB_USER_PROFILE}" style="color: {Colors.GREEN}; text-decoration: none;">@{AppInfo.DEVELOPER}</a>
    </div>
  </div>
</body>
</html>
"""


def generate_today_date():
    """Generate today's date in English format: 'Saturday, January 31, 2026'"""
    now = datetime.datetime.now(datetime.timezone.utc)
    return now.strftime("%A, %B %d, %Y")


def generate_current_year():
    now = datetime.datetime.now(datetime.timezone.utc)
    return str(now.year)


def generate_admin_notification_email_body(users_count, errors=None):
    year = generate_current_year()
    today = generate_today_date()

    errors_html = ""

    if errors:
        errors_html = "<h3>Errors encountered:</h3>"

        for user_id, error in errors.items():
            errors_html += f"""
        <div style="margin-bottom: 20px; padding: 10px; background-color: {Colors.LIGHT_GRAY_2}; border-radius: 4px;">
          <strong>User ID: {user_id}</strong>
          <pre style="white-space: pre-wrap; margin-top: 10px;">{error}</pre>
        </div>
      """

    if users_count > 1:
        users_html = f"<p><strong>{users_count}</strong> users processed.</p>"
    elif users_count == 1:
        users_html = "<p><strong>1</strong> user processed.</p>"
    else:
        users_html = "<p>No users processed.</p>"

    return f"""\
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {{ font-family: Arial, sans-serif; background-color: {Colors.LIGHT_GRAY_1}; color: {Colors.DARK_GRAY}; }}
        .email-container {{ max-width: 800px; margin: 20px auto; background-color: {Colors.WHITE}; border-radius: 8px; border: 1px solid {Colors.LIGHT_GRAY_3}; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }}
        .header {{ background-color: {Colors.GREEN}; color: {Colors.WHITE}; text-align: center; padding: 20px; font-size: 20px; font-weight: bold; }}
        .header-subtitle {{ font-size: 12px; font-weight: normal; }}
        .content {{ padding: 20px; }}
        .footer {{ background-color: {Colors.LIGHT_GRAY_2}; color: #666; text-align: center; padding: 10px; font-size: 12px; }}
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          Scheduler Execution Report
          <div class="header-subtitle">{today}</div>
        </div>
        <div class="content">
          <h2>Execution Summary</h2>
          {users_html}
          {errors_html}
        </div>
        <div class="footer">
          © {year} {AppInfo.APP_NAME} · Developed by <a href="{AppInfo.GITHUB_USER_PROFILE}" style="color: {Colors.GREEN}; text-decoration: none;">@{AppInfo.DEVELOPER}</a>
        </div>
      </div>
    </body>
    </html>
  """


def generate_admin_notification_email_subject():
    return f"[{AppInfo.APP_NAME}] Admin: Scheduler execution report"
