def add_track_to_list(track, all_new_tracks, ARTISTS):
    track_artists = [artist['name'] for artist in track['artists']]
    track_name = track['name']
    track_uri = track['uri']

    if not any(artist in ARTISTS for artist in track_artists):
        return  # Skip if no artist matches

    track_id = (track_name, tuple(track_artists))

    if track_id in all_new_tracks:
        existing_uri = all_new_tracks[track_id]

        if 'explicit' in track['name'].lower() and 'explicit' not in existing_uri.lower():
            all_new_tracks[track_id] = track_uri
            print(f"Replaced clean version with explicit: {track_name} by {', '.join(track_artists)}")

        return

    all_new_tracks[track_id] = track_uri
    print(f"Added: {track_name} by {', '.join(track_artists)}")

def add_tracks_to_playlist(sp, playlist_id, track_uris):
    if track_uris:
        sp.playlist_add_items(playlist_id, track_uris)
        print(f"\nAdded {len(track_uris)} track(s) to the playlist.")
    else:
        print("No new tracks were added to the playlist.")