from datetime import datetime
from config import RESEND_API_KEY, RECIPIENT_EMAIL
import resend
import locale

def generate_email_subject(new_tracks):
  if len(new_tracks) == 1:
    return f"🎶 Nueva canción añadida a tu playlist"

  return f"🎶 {len(new_tracks)} nuevas canciones añadidas a tu playlist"

def generate_email_body(new_tracks):
    try:
      locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
    except Exception:
      pass

    today = datetime.now().strftime("%d de %B de %Y")

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f7f7f7;
                margin: 0;
                padding: 0;
                color: #333;
            }}
            .email-container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: #fefefe;
                border-radius: 8px;
                border: 1px solid #ddd;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }}
            .header {{
                background-color: #1db954;
                color: #fff;
                text-align: center;
                padding: 20px;
                font-size: 20px;
                font-weight: bold;
            }}
            .header-subtitle {{
                font-size: 12px;
                font-weight: normal;
            }}
            .content {{
                padding: 20px;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }}
            table, th, td {{
                border: 1px solid #ddd;
            }}
            th, td {{
                padding: 10px;
                text-align: left;
            }}
            th {{
                background-color: #f4f4f4;
                text-align: center;
            }}
            .footer {{
                background-color: #f4f4f4;
                color: #666;
                text-align: center;
                padding: 10px;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                {len(new_tracks) == 1 and f'📡 Nuevo lanzamiento! 🎵' or f'📡 {len(new_tracks)} Nuevos lanzamientos! 🎵'}
                <div class="header-subtitle">{today}</div>
            </div>
            <div class="content">
                {len(new_tracks) == 1 and '<p>Se ha añadido <strong>una nueva canción</strong> a tu playlist:</p>' or f'<p>Se han añadido <strong>{len(new_tracks)}</strong> nuevas canciones a tu playlist:</p>'}
                <table>
                    <tbody>
    """

    tracks_list_html = ""
    for track in new_tracks:
        track_artists = ", ".join(track['artists'])
        tracks_list_html += f"""
        <tr>
            <td style="text-align: center;">
                <img src="{track['image']}" alt="{track['name']}" style="border-radius: 8px; width: 50px; height: 50px;">
            </td>
            <td>
                <strong>{track['name']}</strong><br>
                <small>{track_artists}</small>
            </td>
        </tr>
        """

    # Footer and closing tags
    html += tracks_list_html
    html += f"""
                    </tbody>
                </table>
                <p style="margin-top: 20px;">Disfruta de los nuevos lanzamientos! 🎧</p>
            </div>
            <div class="footer">
                © {datetime.now().year} - Trackify - Desarrollado por <a href="https://github.com/emlopezr" style="color: #1db954; text-decoration: none;">@emlopezr</a>
            </div>
        </div>
    </body>
    </html>
    """

    return html

def send_email(new_tracks):
  resend.api_key = RESEND_API_KEY

  params: resend.Emails.SendParams = {
      "from": "Trackify <trackify@emlopezr.com>",
      "to": [RECIPIENT_EMAIL],
      "subject": generate_email_subject(new_tracks),
      "html": generate_email_body(new_tracks)
  }

  resend.Emails.send(params)
