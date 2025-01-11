from spotify_api import authenticate, get_new_releases, add_tracks_to_playlist
from track_handler import add_track_to_list
from config import PLAYLIST_ID
from artists import ARTISTS

def main():
    sp = authenticate()
    all_new_tracks = {}

    print(f"Searching new releases for {len(ARTISTS)} followed artists...\n")

    for artist in ARTISTS:
        new_tracks = loop_get_new_releases(sp, artist, 2)

        for track in new_tracks:
            add_track_to_list(track, all_new_tracks, ARTISTS)

    add_tracks_to_playlist(sp, PLAYLIST_ID, list(all_new_tracks.values()))

def loop_get_new_releases(sp, artist, pages=2):
    new_tracks_all = []

    for page in range(pages):
        new_tracks = get_new_releases(sp, artist, days=1, page=page)
        new_tracks_all += new_tracks

    return new_tracks_all

if __name__ == "__main__":
    main()
