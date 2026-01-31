# Quickstart: Ghost Tracks Feature

**Feature**: 002-ghost-tracks
**Date**: 2026-01-31

## Overview

This guide provides the essential information to start implementing the Ghost Tracks feature. The feature allows users to detect and remove unplayable tracks from their Spotify playlists.

## Prerequisites

- TrackWatch backend running (`python manage.py runserver`)
- TrackWatch frontend running (`npm run dev`)
- Valid Spotify developer credentials configured
- User logged in with Spotify OAuth

## Architecture Summary

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend       │────▶│   Spotify API   │
│  GhostTracksPage│     │  ghost_tracks_   │     │                 │
│                 │◀────│  service.py      │◀────│                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Key Files to Create/Modify

### Backend

| File | Action | Purpose |
|------|--------|---------|
| `app/views/ghost_tracks_view.py` | Create | REST endpoints for scan/remove |
| `app/services/ghost_tracks_service.py` | Create | Business logic for ghost track detection |
| `app/clients/spotify/spotify_playlist_api_client.py` | Modify | Add market parameter support |
| `app/urls.py` | Modify | Register new endpoints |

### Frontend

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/GhostTracksPage/GhostTracksPage.tsx` | Create | Main feature page |
| `src/pages/GhostTracksPage/GhostTracksPage.css` | Create | Page styles |
| `src/components/PlaylistSelector/` | Create | Playlist selection UI |
| `src/components/GhostTrackList/` | Create | Ghost track results display |
| `src/services/trackwatch/ghostTracks.ts` | Create | API service calls |
| `src/types/trackwatch/GhostTrack.ts` | Create | TypeScript interfaces |
| `src/App.tsx` | Modify | Add route for Ghost Tracks page |

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/ghost-tracks/playlists` | GET | Get user's owned playlists |
| `/ghost-tracks/scan` | POST | Scan playlists for ghost tracks |
| `/ghost-tracks/remove` | POST | Remove selected ghost tracks |

## User Flow

```
1. User navigates to "Ghost Tracks" tab
2. System loads user's owned playlists
3. User selects one or more playlists
4. User clicks "Scan" button
5. System scans playlists in parallel, shows progress
6. Results display ghost tracks grouped by playlist
7. User selects tracks to remove (individual or bulk)
8. User clicks "Remove Selected" button
9. System removes tracks, shows summary modal
10. User dismisses modal, returns to playlist selection
```

## Key Implementation Notes

### Spotify API Considerations

1. **Market Parameter**: Always pass `market={countryCode}` to get `is_playable` field
2. **Rate Limits**: Implement retry with `Retry-After` header on 429 responses
3. **Pagination**: Playlists endpoint returns max 50 items, tracks endpoint max 100
4. **Owned Playlists**: Filter by comparing `owner.id` with user's Spotify ID

### Performance Requirements

- Scan 10 playlists (500 tracks each) in under 30 seconds
- Use parallel processing (3-5 concurrent threads)
- Show progress indication during long operations

### Error Handling

- Token expiration: Attempt refresh, prompt re-auth if fails
- Rate limiting: Automatic retry with exponential backoff
- Partial failures: Continue operation, report failures in summary

## Testing Checklist

- [ ] Can load owned playlists (excludes followed)
- [ ] Can select multiple playlists
- [ ] Scan detects tracks with `is_playable: false`
- [ ] Results grouped by playlist
- [ ] Can select individual tracks
- [ ] Can use "Select All" / "Deselect All"
- [ ] Removal deletes tracks from Spotify
- [ ] Summary modal shows correct counts
- [ ] Returns to playlist selection after removal
- [ ] Handles empty results (no ghost tracks)
- [ ] Handles API errors gracefully

## Related Documentation

- [spec.md](./spec.md) - Feature specification
- [data-model.md](./data-model.md) - Data structures
- [contracts/ghost-tracks-api.yaml](./contracts/ghost-tracks-api.yaml) - OpenAPI spec
- [research.md](./research.md) - Spotify API research
