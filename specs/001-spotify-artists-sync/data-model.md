# Data Model: Spotify Artists Sync

**Date**: 2026-01-29
**Feature**: 001-spotify-artists-sync

## Overview

This feature removes the local `UserFollowedArtist` table and relies entirely on Spotify as the source of truth for followed artists.

## Entities

### Removed Entities

#### UserFollowedArtist (TO BE DELETED)

**Current Location**: `backend/app/models/user_followed_artist.py`

**Current Schema**:
```python
class UserFollowedArtist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followed_artists")
    artist_id = models.CharField(max_length=255)
    artist_name = models.CharField(max_length=255)

    class Meta:
        db_table = "users_followed_artists"
        unique_together = ["user", "artist_id"]
```

**Action**: Delete model, remove table via migration.

---

### External Entities (Spotify API)

#### Spotify Artist (from API)

**Source**: Spotify Web API response

**Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Spotify artist ID |
| `name` | string | Artist display name |
| `images` | array | Artist images (various sizes) |
| `genres` | array | Associated genres |
| `popularity` | integer | 0-100 popularity score |
| `external_urls.spotify` | string | Spotify URL |

**Usage**: Displayed in UI, used for release detection.

---

#### Spotify Followed Artists Response

**Source**: `GET /me/following?type=artist`

**Structure**:
```json
{
  "artists": {
    "items": [
      {
        "id": "string",
        "name": "string",
        "images": [{"url": "string", "height": 640, "width": 640}],
        "genres": ["string"],
        "popularity": 75,
        "external_urls": {"spotify": "string"}
      }
    ],
    "cursors": {
      "after": "string | null"
    },
    "total": 100,
    "limit": 50
  }
}
```

---

## TypeScript Types

### New Types to Create

#### SpotifyFollowedArtistsResponse

**Location**: `frontend/src/types/spotify/SpotifyFollowedArtistsResponse.ts`

```typescript
export interface SpotifyFollowedArtistsResponse {
  artists: {
    items: SpotifyArtist[];
    cursors: {
      after: string | null;
    };
    total: number;
    limit: number;
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  genres: string[];
  popularity: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}
```

---

## Data Flow Changes

### Before (Current)

```
User Action → Frontend → Backend API → Database (UserFollowedArtist)
                                     ↓
Background Job → Database (UserFollowedArtist) → Spotify API (releases)
```

### After (New)

```
User Action → Frontend → Spotify API (follow/unfollow)
                       ↓
                       Spotify API (get followed artists)

Background Job → Spotify API (get followed artists) → Spotify API (releases)
```

---

## Migration Plan

### Step 1: Add New Functionality
1. Create Spotify follow/unfollow client functions
2. Create frontend service for Spotify following API
3. Update frontend to use Spotify API

### Step 2: Update Backend
1. Update `artist_service.py` to call Spotify API
2. Update `search_followed_releases_use_case.py` to query Spotify

### Step 3: Remove Old Code
1. Delete `UserFollowedArtist` model
2. Create Django migration to drop table
3. Remove related imports and references

---

## Unchanged Entities

The following models remain unchanged:

- **User**: Still stores Spotify credentials and settings
- **UserRecentlyAddedTrack**: Still tracks recently added tracks to prevent duplicates
