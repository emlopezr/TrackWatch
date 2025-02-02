import datetime

from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from config import SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI
from track_handler import sort_tracks
from emails import send_email

def authenticate():
    scopes = ["user-library-read", "playlist-modify-public", "playlist-modify-private"]
    scope_string = " ".join(scopes)

    sp = Spotify(auth_manager=SpotifyOAuth(
        client_id = SPOTIFY_CLIENT_ID,
        client_secret = SPOTIFY_CLIENT_SECRET,
        redirect_uri = SPOTIFY_REDIRECT_URI,
        scope = scope_string,
        open_browser = False
    ))

    return sp

def get_new_releases(sp, artist, days=1, page=0):
    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=days)
    start_date_iso = start_date.isoformat()

    query = f"artist:{artist}"
    if start_date.year == today.year: query += f" year:{start_date.year}"

    results = sp.search(
        q = query,
        type = "track",
        limit = 50,
        offset = page * 50
    )

    new_tracks = []

    for track in results['tracks']['items']:
        release_date = track['album']['release_date']
        album_type = track['album']['album_type']

        is_in_range = start_date_iso <= release_date <= today.isoformat()
        is_from_compilation = album_type == 'compilation'

        if is_in_range and not is_from_compilation:
            new_tracks.append(track)

    return new_tracks

def get_playlist_tracks(sp, playlist_id):
    tracks = []
    results = sp.playlist_items(playlist_id)

    while results:
        for item in results['items']:
            tracks.append(item['track']['uri'])

        results = sp.next(results) if results['next'] else None

    return tracks

def filter_unliked_tracks(sp, tracks_data):
    unliked_tracks = []

    track_uris = [track['uri'] for track in tracks_data]

    for i in range(0, len(track_uris), 50):
        batch_uris = track_uris[i:i + 50]
        liked_status = sp.current_user_saved_tracks_contains(batch_uris)

        for track, liked in zip(tracks_data[i:i + 50], liked_status):
            if not liked: unliked_tracks.append(track)

    return unliked_tracks

def add_tracks_to_playlist(sp, playlist_id, tracks_data):
    existing_tracks = get_playlist_tracks(sp, playlist_id)
    unliked_tracks = filter_unliked_tracks(sp, tracks_data)

    new_tracks = [track for track in tracks_data if track['uri'] not in existing_tracks and track in unliked_tracks]
    skipped_tracks = [track for track in tracks_data if track['uri'] in existing_tracks or track not in unliked_tracks]

    new_tracks = sort_tracks(new_tracks)
    new_tracks_uri = [track['uri'] for track in new_tracks]

    if new_tracks:
        sp.playlist_add_items(playlist_id, new_tracks_uri)

        for track in new_tracks:
            print(f"Added: {track['name']} by {', '.join(track['artists'])}")

        print(f"\nAdded {len(new_tracks_uri)} track(s) to the playlist.")

        if skipped_tracks:
            print(f"Skipped {len(skipped_tracks)} track(s) that were already liked or in the playlist.")

        send_email(new_tracks)

    else:
        if skipped_tracks:
            print(f"Skipped {len(skipped_tracks)} track(s) that were already liked or in the playlist.")
        else:
            print("No new tracks were found.")