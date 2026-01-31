# Implementation Plan: Ghost Tracks Detection and Removal

**Branch**: `002-ghost-tracks` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-ghost-tracks/spec.md`

## Summary

This feature adds a new "Ghost Tracks" tab to TrackWatch that allows users to scan their owned Spotify playlists for unplayable tracks (ghost tracks) and selectively remove them. Ghost tracks are identified by checking if `is_playable = false` or if the track's `available_markets` doesn't include the user's country. The backend processes multiple playlists in parallel and returns results grouped by playlist. Users can select individual or all ghost tracks for removal, with a summary modal shown after successful removal before returning to playlist selection.

## Technical Context

**Language/Version**: Python 3.10+ (Backend), TypeScript 5.6 (Frontend)
**Primary Dependencies**: Django 5.2, Django REST Framework, React 18.3, Vite 6.4, react-router-dom 7.5
**Storage**: PostgreSQL (existing)
**Testing**: Manual testing (no test framework currently configured)
**Target Platform**: Web (Linux server backend, browser frontend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Scan up to 10 playlists (500 tracks each) within 30 seconds
**Constraints**: Spotify API rate limits (429 responses), max 100 tracks per request
**Scale/Scope**: Single user concurrent scans, playlists up to several thousand tracks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Phase 0)

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. API-First Design | ✅ PASS | New endpoints defined in contracts, frontend services in `services/trackwatch/`, types in `types/` |
| II. Service Layer Architecture | ✅ PASS | Business logic in `app/services/ghost_tracks_service.py`, views handle HTTP only, Spotify client extended |
| III. Type Safety | ✅ PASS | TypeScript interfaces for API responses, Django serializers for validation |
| IV. Component Isolation | ✅ PASS | New `GhostTracksPage` follows existing pattern with co-located CSS, uses context for state |
| V. Security-First Development | ✅ PASS | Tokens via headers, input validation, no raw SQL, rate limit handling |

**Gate Result**: PASS - All constitution principles satisfied.

### Post-Design Check (Phase 1)

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. API-First Design | ✅ PASS | OpenAPI contract defined in `contracts/ghost-tracks-api.yaml` with 3 endpoints |
| II. Service Layer Architecture | ✅ PASS | `ghost_tracks_service.py` handles scan/removal logic; views are HTTP-only wrappers |
| III. Type Safety | ✅ PASS | `GhostTrack.ts` defines all interfaces; data-model.md specifies field types |
| IV. Component Isolation | ✅ PASS | `PlaylistSelector/` and `GhostTrackList/` are isolated, receive data via props |
| V. Security-First Development | ✅ PASS | Tokens in headers only; country code validated (ISO 3166-1); rate limit retry logic |

**Post-Design Gate Result**: PASS - Design artifacts comply with all constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/002-ghost-tracks/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── ghost-tracks-api.yaml
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── clients/spotify/
│   │   └── spotify_playlist_api_client.py  # Extend with ghost track detection
│   ├── services/
│   │   └── ghost_tracks_service.py         # New: scan and removal logic
│   └── views/
│       └── ghost_tracks_view.py            # New: API endpoints

frontend/
├── src/
│   ├── pages/
│   │   └── GhostTracksPage/                # New: main feature page
│   │       ├── GhostTracksPage.tsx
│   │       └── GhostTracksPage.css
│   ├── components/
│   │   ├── PlaylistSelector/               # New: playlist multi-select
│   │   └── GhostTrackList/                 # New: results display with selection
│   ├── services/trackwatch/
│   │   └── ghostTracks.ts                  # New: API calls
│   └── types/trackwatch/
│       └── GhostTrack.ts                   # New: type definitions
```

**Structure Decision**: Web application pattern matching existing codebase. New feature adds parallel structure to existing Generator feature.

## Complexity Tracking

> No constitution violations requiring justification.

*No entries required - design follows established patterns.*
