from app.constants import AppInfo, Colors, Assets, System
import datetime
import locale
import logging

logger = logging.getLogger(__name__)

def generate_welcome_email_subject():
  return f"🎶 ¡Bienvenido a {AppInfo.APP_NAME}! ❤️"

def generate_added_tracks_email_subject(user_added_tracks):
  if len(user_added_tracks) == 1: return "🎶 Nueva canción añadida a tu playlist"
  return f"🎶 {len(user_added_tracks)} nuevas canciones añadidas a tu playlist"

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
      🎶 ¡Bienvenido a {AppInfo.APP_NAME}! ❤️
      <div class="header-subtitle">Gracias por unirte a nosotros</div>
    </div>
    <div class="content">
      <p>Hola {user.name}, ¡Gracias por registrarte en {AppInfo.APP_NAME}! 🎉</p>
      <p>Ahora podrás estar al tanto de los nuevos lanzamientos de tus artistas favoritos sin esforzarte.</p>
      <p>¡No olvides seguir a tus artistas favoritos para día a día tener sus últimas canciones en tu playlist y recibir notificaciones!</p>
      <p>¡Que disfrutes de la música! 🎧</p>
    </div>
    <div class="footer">
      © {year} - {AppInfo.APP_NAME} - Desarrollado por <a href="{AppInfo.GITHUB_USER_PROFILE}" style="color: {Colors.GREEN}; text-decoration: none;">@{AppInfo.DEVELOPER}</a>
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
    "📡 Nuevo lanzamiento! 🎵" if len(user_added_tracks) == 1
    else f"📡 {len(user_added_tracks)} Nuevos lanzamientos! 🎵"
  )

  content_msg = (
    "<p>Se ha añadido <strong>una nueva canción</strong> a tu playlist:</p>" if len(user_added_tracks) == 1
    else f"<p>Se han añadido <strong>{len(user_added_tracks)}</strong> nuevas canciones a tu playlist:</p>"
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
      <p style="margin-top: 20px;">Disfruta de los nuevos lanzamientos! 🎧</p>
    </div>
    <div class="footer">
      © {year} - {AppInfo.APP_NAME} - Desarrollado por <a href="{AppInfo.GITHUB_USER_PROFILE}" style="color: {Colors.GREEN}; text-decoration: none;">@{AppInfo.DEVELOPER}</a>
    </div>
  </div>
</body>
</html>
"""

def generate_today_date():
  locales_to_try = ["es_ES.UTF-8", "es_ES", "en_US.UTF-8", "en_US", "C"]

  for locale_name in locales_to_try:
    try:
      locale.setlocale(locale.LC_TIME, locale_name)
      now = datetime.datetime.now(datetime.timezone.utc)

      day_of_week = now.strftime("%A").capitalize()
      day_of_month = now.day
      month = now.strftime("%B")
      year = now.year

      return f"{day_of_week} {day_of_month} de {month} de {year}"

    except locale.Error:
      logger.debug(f"Locale {locale_name} not available, trying next...")
      continue

  now = datetime.datetime.now(datetime.timezone.utc)
  return now.strftime("%d/%m/%Y")

def generate_current_year():
  now = datetime.datetime.now(datetime.timezone.utc)
  return str(now.year)

def generate_admin_notification_email_body(users_count, errors=None):
  year = generate_current_year()
  today = generate_today_date()

  errors_html = ""

  if errors:
    errors_html = "<h3>Errores encontrados:</h3>"

    for user_id, error in errors.items():
      errors_html += f"""
        <div style="margin-bottom: 20px; padding: 10px; background-color: {Colors.LIGHT_GRAY_2}; border-radius: 4px;">
          <strong>Usuario ID: {user_id}</strong>
          <pre style="white-space: pre-wrap; margin-top: 10px;">{error}</pre>
        </div>
      """

  if users_count > 1:
    users_html = f"<p>Se procesaron <strong>{users_count}</strong> usuarios.</p>"
  elif users_count == 1:
    users_html = "<p>Se procesó <strong>1</strong> usuario.</p>"
  else:
    users_html = "<p>No se procesó ningún usuario.</p>"

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
          📊 Reporte de errores en la ejecución del Cronjob
          <div class="header-subtitle">{today}</div>
        </div>
        <div class="content">
          <h2>Resumen de la ejecución:</h2>
          {users_html}
          {errors_html}
        </div>
        <div class="footer">
          © {year} - {AppInfo.APP_NAME} - Desarrollado por <a href="{AppInfo.GITHUB_USER_PROFILE}" style="color: {Colors.GREEN}; text-decoration: none;">@{AppInfo.DEVELOPER}</a>
        </div>
      </div>
    </body>
    </html>
  """

def generate_admin_notification_email_subject():
  return f"📊 [ADMIN] {AppInfo.APP_NAME} - Reporte de errores en la ejecución del Cronjob"
