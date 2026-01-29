# Implementation Plan: Spotify Artists Sync

**Branch**: `001-spotify-artists-sync` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-spotify-artists-sync/spec.md`

## Summary

Migrate followed artists management from local database (`UserFollowedArtist` table) to Spotify as the single source of truth. This involves:
1. Implementing Spotify API calls to get, follow, and unfollow artists
2. Updating frontend to call Spotify API directly for artist operations
3. Removing the `UserFollowedArtist` model and related database table
4. Updating background jobs to query Spotify for followed artists at runtime

## Technical Context

**Language/Version**: Python 3.10+ (Backend), TypeScript 5.6 (Frontend)
**Primary Dependencies**: Django 5.2, Django REST Framework, React 18.3, Vite 6.4
**Storage**: PostgreSQL (removing `UserFollowedArtist` table)
**Testing**: Manual testing (no automated tests currently)
**Target Platform**: Web application (Linux server backend, browser frontend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Artist list retrieval <3s, follow/unfollow actions <2s
**Constraints**: Spotify API rate limits, token refresh handling
**Scale/Scope**: Single user (current), up to 500 followed artists

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. API-First Design | ✅ PASS | New endpoints defined with clear contracts in `contracts/` |
| II. Service Layer Architecture | ✅ PASS | New Spotify client methods in `app/clients/spotify/`, service layer for business logic |
| III. Type Safety | ✅ PASS | TypeScript types for Spotify responses, Django models with explicit types |
| IV. Component Isolation | ✅ PASS | Frontend services handle API calls, components receive data via props/context |
| V. Security-First Development | ✅ PASS | Tokens passed via headers, no secrets in code, CORS configured |

## Project Structure

### Documentation (this feature)

```text
specs/001-spotify-artists-sync/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── clients/
│   │   └── spotify/
│   │       ├── spotify_api_client.py        # Base client (existing)
│   │       └── spotify_follow_api_client.py # NEW: Follow/unfollow operations
│   ├── services/
│   │   ├── artist_service.py                # MODIFY: Use Spotify API instead of DB
│   │   └── search_followed_releases_use_case.py  # MODIFY: Query Spotify for artists
│   ├── models/
│   │   └── user_followed_artist.py          # DELETE: Remove model
│   ├── views/
│   │   └── artists_view.py                  # MODIFY: Pass through to Spotify
│   └── migrations/
│       └── XXXX_remove_userfollowedartist.py # NEW: Migration to drop table

frontend/
├── src/
│   ├── services/
│   │   ├── spotify/
│   │   │   └── spotifyFollowing.ts          # NEW: Spotify follow API calls
│   │   └── trackwatch/
│   │       └── trackwatchArtists.ts         # MODIFY: Call Spotify instead of backend
│   └── types/
│       └── spotify/
│           └── SpotifyFollowedArtistsResponse.ts  # NEW: Type definitions
```

**Structure Decision**: Web application structure with separate frontend and backend. Changes primarily affect the service layer and Spotify client modules.

## Complexity Tracking

> No constitution violations requiring justification.

| Aspect | Complexity Level | Justification |
|--------|------------------|---------------|
| Spotify API Integration | Low | Standard REST calls, well-documented API |
| Database Migration | Low | Simple table removal, no data migration needed |
| Frontend Changes | Low | Replacing backend calls with direct Spotify calls |
