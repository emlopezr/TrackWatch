from spotify_api import authenticate, get_new_releases
from track_handler import add_track_to_list, add_tracks_to_playlist
from config import PLAYLIST_ID
from artists import ARTISTS

def main():
    sp = authenticate()
    all_new_tracks = {}

    for artist in ARTISTS:
        new_tracks = get_new_releases(sp, artist, 10)

        for track in new_tracks:
            add_track_to_list(track, all_new_tracks, ARTISTS)

    add_tracks_to_playlist(sp, PLAYLIST_ID, list(all_new_tracks.values()))

if __name__ == "__main__":
    main()