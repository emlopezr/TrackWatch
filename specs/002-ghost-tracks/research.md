# Research: Ghost Tracks Detection and Removal

**Feature**: 002-ghost-tracks
**Date**: 2026-01-31

## Research Questions

### 1. Filtering Owned Playlists

**Question**: How to get only playlists owned by the current user (not followed playlists)?

**Decision**: Client-side filtering by comparing `owner.id` with current user ID

**Rationale**: The Spotify API endpoint `GET /me/playlists` returns both owned and followed playlists. There is no built-in server-side filter. The response includes an `owner` object for each playlist with `owner.id` that can be compared against the authenticated user's ID.

**Implementation**:
```python
# Filter owned playlists
owned_playlists = [p for p in all_playlists if p['owner']['id'] == user.id]
```

**Alternatives Considered**:
- None available - Spotify API does not support server-side filtering for playlist ownership

---

### 2. Track Availability Detection

**Question**: How to detect if a track is playable in a specific market?

**Decision**: Use `market` parameter with country code to get `is_playable` boolean

**Rationale**: When the `market` parameter is provided to `GET /playlists/{id}/tracks`:
- The `available_markets` array is replaced by a boolean `is_playable` field
- Tracks that are unavailable show `is_playable: false` with a `restrictions` object containing `reason: "market"`
- Track relinking is automatic - if an alternative exists, `is_playable` will be true

**Implementation**:
```python
response = spotify_api_request(
    method="GET",
    endpoint=f"/playlists/{playlist_id}/tracks",
    token=token,
    params={"market": country_code, "limit": 50}
)
# Each item.track will have is_playable boolean
```

**Alternatives Considered**:
- Using `available_markets` array without market parameter: Rejected because it requires checking array membership for each track, and doesn't account for track relinking

---

### 3. Removing Tracks from Playlists

**Question**: What is the endpoint and payload format to remove tracks from a playlist?

**Decision**: Use `DELETE /playlists/{playlist_id}/tracks` with array of track URIs

**Rationale**: The endpoint accepts up to 100 track URIs per request. Each track is specified as an object with a `uri` field. The endpoint removes ALL instances of each matching URI.

**Implementation**:
```python
body = {
    "tracks": [{"uri": uri} for uri in track_uris]
}
response = spotify_api_request(
    method="DELETE",
    endpoint=f"/playlists/{playlist_id}/tracks",
    token=token,
    json_data=body
)
```

**Constraints**:
- Maximum 100 tracks per request
- Requires `playlist-modify-public` or `playlist-modify-private` scope

**Alternatives Considered**:
- Using snapshot_id for validation: Optional enhancement, not critical for MVP

---

### 4. Rate Limit Handling

**Question**: How should Spotify API rate limits (429 responses) be handled?

**Decision**: Implement exponential backoff with `Retry-After` header respect

**Rationale**: Spotify uses a rolling 30-second window for rate limiting. When a 429 response is received, the `Retry-After` header specifies seconds to wait. Best practice is to:
1. Respect the `Retry-After` value
2. Use exponential backoff for repeated failures
3. Batch requests where possible (max 100 tracks per removal request)

**Implementation**:
```python
import time

def spotify_request_with_retry(request_func, max_retries=3):
    for attempt in range(max_retries):
        response = request_func()
        if response.status_code == 429:
            retry_after = int(response.headers.get('Retry-After', 1))
            wait_time = retry_after * (2 ** attempt)  # Exponential backoff
            time.sleep(wait_time)
            continue
        return response
    raise Exception("Max retries exceeded")
```

**Alternatives Considered**:
- Fail immediately on 429: Rejected - poor user experience for large playlists
- Fixed delay retry: Rejected - doesn't respect Spotify's Retry-After guidance

---

### 5. Parallel Processing Strategy

**Question**: How to process multiple playlists efficiently while respecting rate limits?

**Decision**: Use Python's `concurrent.futures.ThreadPoolExecutor` with bounded concurrency

**Rationale**: Processing playlists sequentially would be too slow for the 30-second performance goal. Using parallel processing with a bounded thread pool (3-5 concurrent requests) provides good throughput while staying within rate limits.

**Implementation**:
```python
from concurrent.futures import ThreadPoolExecutor, as_completed

def scan_playlists(playlist_ids, user, country_code):
    results = {}
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(scan_single_playlist, pid, user, country_code): pid
            for pid in playlist_ids
        }
        for future in as_completed(futures):
            playlist_id = futures[future]
            results[playlist_id] = future.result()
    return results
```

**Alternatives Considered**:
- asyncio: Would require significant refactoring of existing sync codebase
- Sequential processing: Too slow for performance requirements
- Higher concurrency: Risk of hitting rate limits more frequently

---

## Required Spotify OAuth Scopes

Based on the research, the following scopes are required:

| Scope | Purpose |
|-------|---------|
| `playlist-read-private` | Read user's private playlists |
| `playlist-read-collaborative` | Read collaborative playlists (to filter them out) |
| `playlist-modify-public` | Remove tracks from public playlists |
| `playlist-modify-private` | Remove tracks from private playlists |

**Note**: The existing TrackWatch application should already have most of these scopes configured for the Generator feature. Verify and add any missing scopes.

---

## API Response Field Summary

### Playlist Object (relevant fields)
```json
{
  "id": "playlist_id",
  "name": "Playlist Name",
  "images": [{"url": "..."}],
  "tracks": {"total": 100},
  "owner": {"id": "user_id"}
}
```

### Track Object with Market Parameter (relevant fields)
```json
{
  "track": {
    "id": "track_id",
    "uri": "spotify:track:xxx",
    "name": "Track Name",
    "is_playable": false,
    "restrictions": {"reason": "market"},
    "artists": [{"name": "Artist Name"}],
    "album": {
      "name": "Album Name",
      "images": [{"url": "..."}]
    }
  }
}
```
