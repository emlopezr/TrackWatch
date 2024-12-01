import datetime
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Spotify App Credentials from .env
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")
PLAYLIST_ID = os.getenv("SPOTIFY_PLAYLIST_ID")

# Test data
ARTISTS = []

# Authenticate with Spotify
scope = "playlist-modify-public playlist-modify-private"

sp = Spotify(auth_manager=SpotifyOAuth(
    client_id=SPOTIFY_CLIENT_ID,
    client_secret=SPOTIFY_CLIENT_SECRET,
    redirect_uri=SPOTIFY_REDIRECT_URI,
    scope=scope,
    open_browser=False
))


"""Fetch tracks released by the artist (including featuring) in the last day."""
def get_new_releases(artist, days = 1):
    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=days)
    start_date_iso = start_date.isoformat()
    
    print(f"\nSearching for new releases by {artist} from {start_date_iso} to {today.isoformat()}...")

    # Search for tracks where the artist is featured
    results = sp.search(
        q=f"artist:{artist} year:{today.year}",
        type="track",
        limit=50
    )

    new_tracks = []

    for track in results['tracks']['items']:
        release_date = track['album']['release_date']

        # Ensure the release date is within the specified range
        if start_date_iso <= release_date <= today.isoformat():
            new_tracks.append(track)

    if not new_tracks:
        print("No new tracks found.")
    return new_tracks


"""Add tracks to the specified playlist."""
def add_tracks_to_playlist(playlist_id, track_uris):
    if track_uris:
        sp.playlist_add_items(playlist_id, track_uris)
        print(f"\nAdded {len(track_uris)} track(s) to the playlist.")
    else:
        print("No new tracks were added to the playlist.")


"""
Adds a track URI to the all_new_tracks set after verifying:
- At least one of the track's artists is in the ARTISTS list.
- The track's name and artists are unique, handling explicit/clean versions.
"""
def add_tracks_to_all_new_tracks(track, all_new_tracks):
    # Get the track's artist(s) and name
    track_artists = [artist['name'] for artist in track['artists']]
    track_name = track['name']
    track_uri = track['uri']

    # Check if the track artist is in the ARTISTS list
    if not any(artist in ARTISTS for artist in track_artists):
        return  # Skip if no artist matches

    # Create a unique identifier for the track based on name and artist(s)
    track_id = (track_name, tuple(track_artists))  # Use a tuple of artist names as part of the identifier

    # Check if the track already exists in the set
    if track_id in all_new_tracks:
        # If it's already in the set, check if the URI is explicit or clean
        existing_uri = all_new_tracks[track_id]
        if 'explicit' in track['name'].lower() and 'explicit' not in existing_uri.lower():
            # If the existing track is clean and this one is explicit, replace it
            all_new_tracks[track_id] = track_uri
            print(f"Replaced clean version with explicit: {track_name} by {', '.join(track_artists)}")
        return  # If the track is not explicit or already replaced, skip

    # If it's a new track, add it to the set
    all_new_tracks[track_id] = track_uri
    print(f"Added: {track_name} by {', '.join(track_artists)}")


# Main process
if __name__ == "__main__":
    all_new_tracks = {}

    for artist in ARTISTS:
        new_tracks = get_new_releases(artist, 1)

        for track in new_tracks:
            add_tracks_to_all_new_tracks(track, all_new_tracks)

    # Convert dictionary values to a list of URIs for the playlist
    add_tracks_to_playlist(PLAYLIST_ID, list(all_new_tracks.values()))  # Only URIs to the playlist

