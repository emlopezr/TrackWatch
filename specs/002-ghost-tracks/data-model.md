# Data Model: Ghost Tracks Detection and Removal

**Feature**: 002-ghost-tracks
**Date**: 2026-01-31

## Overview

This feature does NOT require new database models. All data is transient and sourced directly from the Spotify API. The data structures below represent API request/response shapes and frontend state management types.

## Entities

### Playlist (from Spotify API)

Represents a user's Spotify playlist for selection.

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| id | string | Spotify playlist ID | Spotify API |
| name | string | Playlist display name | Spotify API |
| imageUrl | string \| null | Playlist cover image URL | Spotify API (`images[0].url`) |
| trackCount | number | Total tracks in playlist | Spotify API (`tracks.total`) |
| ownerId | string | Owner's Spotify user ID | Spotify API (`owner.id`) |

**Validation Rules**:
- `id` must be a valid Spotify playlist ID
- `ownerId` must match authenticated user's ID (for owned playlists filter)

---

### GhostTrack

Represents an unplayable track detected during scan.

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| trackId | string | Spotify track ID | Spotify API (`track.id`) |
| trackUri | string | Spotify track URI for removal | Spotify API (`track.uri`) |
| trackName | string | Track display name | Spotify API (`track.name`) |
| artistNames | string[] | List of artist names | Spotify API (`track.artists[].name`) |
| albumName | string | Album name | Spotify API (`track.album.name`) |
| albumImageUrl | string \| null | Album cover thumbnail | Spotify API (`track.album.images[].url`) |
| playlistId | string | Source playlist ID | Request context |
| playlistName | string | Source playlist name | Request context |
| reason | "market" \| "not_playable" | Why track is a ghost | Derived |

**Validation Rules**:
- `trackUri` must follow format `spotify:track:{id}`
- `reason` determined by: `is_playable === false` → check `restrictions.reason`

**State Transitions**:
```
[Detected] → [Selected] → [Removed]
     ↓           ↓
[Deselected] ←──┘
```

---

### ScanResult

Aggregated result of scanning one or more playlists.

| Field | Type | Description |
|-------|------|-------------|
| playlists | PlaylistScanResult[] | Results per playlist |
| totalGhostTracks | number | Sum of all ghost tracks found |
| scanDurationMs | number | Time taken for scan |

---

### PlaylistScanResult

Result of scanning a single playlist.

| Field | Type | Description |
|-------|------|-------------|
| playlistId | string | Scanned playlist ID |
| playlistName | string | Playlist name |
| ghostTracks | GhostTrack[] | Unplayable tracks found |
| totalTracks | number | Total tracks in playlist |
| scannedTracks | number | Tracks actually scanned |
| error | string \| null | Error message if scan failed |

---

### RemovalResult

Result of removing selected tracks.

| Field | Type | Description |
|-------|------|-------------|
| playlistId | string | Playlist ID |
| playlistName | string | Playlist name |
| removedCount | number | Successfully removed tracks |
| failedCount | number | Failed removals |
| failedTracks | string[] | URIs of failed tracks |

---

## Relationships

```
User (1) ──owns──> (*) Playlist
Playlist (1) ──contains──> (*) Track
Track ──detected as──> GhostTrack (if is_playable=false for user's market)

ScanResult (1) ──contains──> (*) PlaylistScanResult
PlaylistScanResult (1) ──contains──> (*) GhostTrack
```

---

## Frontend State Model

### GhostTracksPageState

```typescript
interface GhostTracksPageState {
  // Phase: Selection
  availablePlaylists: Playlist[];
  selectedPlaylistIds: Set<string>;
  isLoadingPlaylists: boolean;

  // Phase: Scanning
  isScanning: boolean;
  scanProgress: number; // 0-100
  scanResult: ScanResult | null;

  // Phase: Review & Select
  selectedTrackKeys: Set<string>; // Format: `${playlistId}:${trackUri}`

  // Phase: Removal
  isRemoving: boolean;
  removalResults: RemovalResult[] | null;

  // Modal
  showModal: boolean;
  modalType: 'success' | 'error' | 'info';
  modalContent: ModalContent;
}
```

**Key**: `${playlistId}:${trackUri}` uniquely identifies a ghost track instance (same track can appear in multiple playlists).

---

## API Data Flow

```
1. GET /me/playlists → Filter by owner.id → Playlist[]
2. POST /ghost-tracks/scan {playlistIds, countryCode}
   → For each playlist: GET /playlists/{id}/tracks?market={code}
   → Filter tracks where is_playable=false
   → Return ScanResult
3. POST /ghost-tracks/remove {tracks: [{playlistId, trackUris}]}
   → For each playlist: DELETE /playlists/{id}/tracks
   → Return RemovalResult[]
```
