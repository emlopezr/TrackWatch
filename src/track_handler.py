def add_track_to_list(track, all_new_tracks, ARTISTS, found_tracks=[]):
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
    found_tracks.append({'name': track_name, 'artists': track_artists, 'uri': track_uri})