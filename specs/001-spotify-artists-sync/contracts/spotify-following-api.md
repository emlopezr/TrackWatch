# Spotify Following API Contract

**Feature**: 001-spotify-artists-sync
**Date**: 2026-01-29

## Base URL

```
https://api.spotify.com/v1
```

## Authentication

All requests require Bearer token in Authorization header:
```
Authorization: Bearer {access_token}
```

---

## Endpoints

### GET /me/following

**Description**: Get the current user's followed artists.

**Required Scope**: `user-follow-read`

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | string | Yes | - | Must be `artist` |
| `after` | string | No | - | Last artist ID for pagination |
| `limit` | integer | No | 20 | Items per page (1-50) |

**Request Example**:
```http
GET /me/following?type=artist&limit=50
Authorization: Bearer BQD...xyz
```

**Response 200 OK**:
```json
{
  "artists": {
    "items": [
      {
        "id": "0oSGxfWSnnOXhD2fKuz2Gy",
        "name": "David Bowie",
        "images": [
          {"url": "https://i.scdn.co/image/...", "height": 640, "width": 640}
        ],
        "genres": ["art rock", "glam rock"],
        "popularity": 78,
        "external_urls": {
          "spotify": "https://open.spotify.com/artist/0oSGxfWSnnOXhD2fKuz2Gy"
        }
      }
    ],
    "cursors": {
      "after": "0I2XqVjrcIkzdAVz3n5HmG"
    },
    "total": 150,
    "limit": 50
  }
}
```

**Response 401 Unauthorized**:
```json
{
  "error": {
    "status": 401,
    "message": "The access token expired"
  }
}
```

---

### PUT /me/following

**Description**: Add the current user as a follower of one or more artists.

**Required Scope**: `user-follow-modify`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Must be `artist` |
| `ids` | string | Yes | Comma-separated artist IDs (max 50) |

**Request Example**:
```http
PUT /me/following?type=artist&ids=0oSGxfWSnnOXhD2fKuz2Gy
Authorization: Bearer BQD...xyz
```

**Response 204 No Content**: Success, no response body.

**Response 401 Unauthorized**:
```json
{
  "error": {
    "status": 401,
    "message": "The access token expired"
  }
}
```

---

### DELETE /me/following

**Description**: Remove the current user as a follower of one or more artists.

**Required Scope**: `user-follow-modify`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Must be `artist` |
| `ids` | string | Yes | Comma-separated artist IDs (max 50) |

**Request Example**:
```http
DELETE /me/following?type=artist&ids=0oSGxfWSnnOXhD2fKuz2Gy
Authorization: Bearer BQD...xyz
```

**Response 204 No Content**: Success, no response body.

**Response 401 Unauthorized**:
```json
{
  "error": {
    "status": 401,
    "message": "The access token expired"
  }
}
```

---

## Error Responses

| Status | Meaning | Action |
|--------|---------|--------|
| 400 | Bad Request | Check parameters |
| 401 | Unauthorized | Refresh token |
| 403 | Forbidden | Re-authorize with scopes |
| 429 | Rate Limited | Retry after `Retry-After` header |
| 500+ | Server Error | Retry with backoff |

---

## Pagination Pattern

```typescript
async function getAllFollowedArtists(token: string): Promise<Artist[]> {
  const artists: Artist[] = [];
  let after: string | null = null;

  do {
    const url = new URL('https://api.spotify.com/v1/me/following');
    url.searchParams.set('type', 'artist');
    url.searchParams.set('limit', '50');
    if (after) url.searchParams.set('after', after);

    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    artists.push(...data.artists.items);
    after = data.artists.cursors?.after ?? null;
  } while (after);

  return artists;
}
```
