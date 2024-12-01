import datetime

from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from config import SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI

def authenticate():
    scope = "playlist-modify-public playlist-modify-private"

    sp = Spotify(auth_manager=SpotifyOAuth(
        client_id = SPOTIFY_CLIENT_ID,
        client_secret = SPOTIFY_CLIENT_SECRET,
        redirect_uri = SPOTIFY_REDIRECT_URI,
        scope = scope,
        open_browser = False
    ))

    return sp

def get_new_releases(sp, artist, days=1):
    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=days)
    start_date_iso = start_date.isoformat()

    results = sp.search(
        q = f"artist:{artist} year:{start_date.year}",
        type = "track",
        limit = 50
    )

    new_tracks = []

    for track in results['tracks']['items']:
        release_date = track['album']['release_date']

        if start_date_iso <= release_date <= today.isoformat():
            new_tracks.append(track)

    return new_tracks