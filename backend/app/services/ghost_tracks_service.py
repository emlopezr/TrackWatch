from concurrent.futures import ThreadPoolExecutor, as_completed
import logging
import time
from app.clients.spotify.spotify_playlist_api_client import (
    get_user_playlists,
    get_playlist_tracks_with_market,
    remove_tracks_from_playlist
)

logger = logging.getLogger(__name__)


def get_owned_playlists(token, user_id):
    all_playlists = get_user_playlists(token)
    owned = []

    for playlist in all_playlists:
        owner = playlist.get("owner", {})

        if owner.get("id") == user_id:
            images = playlist.get("images", [])
            tracks_info = playlist.get("tracks", {})
            owned.append({
                "id": playlist.get("id"),
                "name": playlist.get("name"),
                "imageUrl": images[0].get("url") if images else None,
                "trackCount": tracks_info.get("total", 0)
            })

    return owned


def scan_playlist_for_ghost_tracks(token, playlist_id, playlist_name, market):
    try:
        tracks = get_playlist_tracks_with_market(token, playlist_id, market)
        ghost_tracks = []
        scanned = 0

        for item in tracks:
            if not isinstance(item, dict):
                continue
            track = item.get("track")
            if not track or not isinstance(track, dict):
                continue

            scanned += 1
            is_playable = track.get("is_playable", True)

            if not is_playable:
                restrictions = track.get("restrictions", {})
                reason = restrictions.get("reason", "not_playable")
                if reason == "market":
                    ghost_reason = "market"
                else:
                    ghost_reason = "not_playable"

                artists = track.get("artists", [])
                artist_names = [a.get("name", "") for a in artists if isinstance(a, dict)]

                album = track.get("album", {})
                album_images = album.get("images", [])
                album_image_url = album_images[0].get("url") if album_images else None

                ghost_tracks.append({
                    "trackId": track.get("id"),
                    "trackUri": track.get("uri"),
                    "trackName": track.get("name"),
                    "artistNames": artist_names,
                    "albumName": album.get("name", ""),
                    "albumImageUrl": album_image_url,
                    "playlistId": playlist_id,
                    "playlistName": playlist_name,
                    "reason": ghost_reason
                })

        return {
            "playlistId": playlist_id,
            "playlistName": playlist_name,
            "ghostTracks": ghost_tracks,
            "totalTracks": len(tracks),
            "scannedTracks": scanned,
            "error": None
        }
    except Exception:
        logger.warning("Unable to scan Spotify playlist %s", playlist_id)
        return {
            "playlistId": playlist_id,
            "playlistName": playlist_name,
            "ghostTracks": [],
            "totalTracks": 0,
            "scannedTracks": 0,
            "error": "Unable to scan playlist"
        }


def scan_playlists_parallel(token, playlist_infos, market, max_workers=3):
    start_time = time.time()
    results = []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(
                scan_playlist_for_ghost_tracks,
                token,
                p["id"],
                p["name"],
                market
            ): p["id"]
            for p in playlist_infos
        }

        for future in as_completed(futures):
            result = future.result()
            results.append(result)

    end_time = time.time()
    duration_ms = int((end_time - start_time) * 1000)

    total_ghost_tracks = sum(len(r["ghostTracks"]) for r in results)

    return {
        "playlists": results,
        "totalGhostTracks": total_ghost_tracks,
        "scanDurationMs": duration_ms
    }


def remove_tracks_from_playlists(token, removals):
    results = []
    batch_size = 100

    for removal in removals:
        playlist_id = removal.get("playlistId")
        playlist_name = removal.get("playlistName", "")
        track_uris = removal.get("trackUris", [])

        removed_count = 0
        failed_count = 0
        failed_tracks = []

        # Process in batches of 100
        for i in range(0, len(track_uris), batch_size):
            batch = track_uris[i:i + batch_size]
            try:
                remove_tracks_from_playlist(token, playlist_id, batch)
                removed_count += len(batch)
            except Exception:
                failed_count += len(batch)
                failed_tracks.extend(batch)

        results.append({
            "playlistId": playlist_id,
            "playlistName": playlist_name,
            "removedCount": removed_count,
            "failedCount": failed_count,
            "failedTracks": failed_tracks
        })

    return results
