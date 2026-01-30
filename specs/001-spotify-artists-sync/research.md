# Research: Spotify Artists Sync

**Date**: 2026-01-29
**Feature**: 001-spotify-artists-sync

## Spotify Web API Endpoints

### Get User's Followed Artists

**Endpoint**: `GET /me/following?type=artist`

**Required Scope**: `user-follow-read`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Must be `artist` |
| `after` | string | No | Last artist ID for pagination |
| `limit` | integer | No | Max items to return (1-50, default 20) |

**Response**: 200 OK with `artists` object containing:
- `items[]`: Array of artist objects
- `cursors.after`: Cursor for next page (null when no more results)
- `total`: Total number of followed artists

**Pagination Strategy**: Use cursor-based pagination with `after` parameter. Loop until `cursors.after` is null.

**Source**: [Spotify Web API Reference - Get Followed Artists](https://developer.spotify.com/documentation/web-api/reference/get-followed)

---

### Follow Artists

**Endpoint**: `PUT /me/following?type=artist&ids={ids}`

**Required Scope**: `user-follow-modify`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Must be `artist` |
| `ids` | string | Yes | Comma-separated artist IDs (max 50) |

**Response**: 204 No Content on success

**Source**: [Spotify Web API Reference](https://developer.spotify.com/documentation/web-api/reference)

---

### Unfollow Artists

**Endpoint**: `DELETE /me/following?type=artist&ids={ids}`

**Required Scope**: `user-follow-modify`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Must be `artist` |
| `ids` | string | Yes | Comma-separated artist IDs (max 50) |

**Response**: 204 No Content on success

**Source**: [Spotify Web API Reference - Unfollow Artists](https://developer.spotify.com/documentation/web-api/reference/unfollow-artists-users)

---

## OAuth Scopes

### Current Scopes (Assumed)
The application currently uses scopes for:
- User profile access
- Playlist management
- Track/album information

### New Scopes Required
- `user-follow-read`: Read user's followed artists
- `user-follow-modify`: Follow/unfollow artists

**Action Required**: Update OAuth authorization URL to include new scopes. Users will need to re-authenticate once.

---

## Implementation Decisions

### Decision 1: Where to Call Spotify API

**Decision**: Frontend calls Spotify API directly for follow/unfollow; backend calls for background jobs.

**Rationale**:
- Frontend already has access token and makes direct Spotify calls (e.g., `spotifyArtists.ts`)
- Reduces backend complexity
- Backend needs Spotify calls for scheduled release detection jobs

**Alternatives Considered**:
1. All calls through backend → Adds latency, backend becomes proxy
2. All calls from frontend → Background jobs can't access Spotify without user session

---

### Decision 2: Pagination Handling

**Decision**: Fetch all followed artists using cursor pagination in a loop until `cursors.after` is null.

**Rationale**:
- Users can have up to 500 followed artists (per spec)
- Spotify returns max 50 per request
- Need complete list for display and background job processing

**Implementation**:
```typescript
async function getAllFollowedArtists(token: string): Promise<Artist[]> {
  const artists: Artist[] = [];
  let after: string | null = null;

  do {
    const response = await fetchFollowedArtists(token, after, 50);
    artists.push(...response.artists.items);
    after = response.artists.cursors?.after ?? null;
  } while (after);

  return artists;
}
```

---

### Decision 3: Error Handling Strategy

**Decision**: Handle Spotify API errors with user-friendly messages and retry logic for transient failures.

**Error Mapping**:
| Spotify Status | User Message | Action |
|----------------|--------------|--------|
| 401 Unauthorized | Token expired | Trigger token refresh |
| 403 Forbidden | Permission denied | Prompt re-authentication |
| 429 Rate Limited | Too many requests | Retry after delay |
| 5xx Server Error | Spotify unavailable | Retry with backoff |

---

### Decision 4: Database Migration Strategy

**Decision**: Create Django migration to remove `UserFollowedArtist` model and drop table.

**Rationale**:
- Clean removal of unused code
- No data migration needed (Spotify is source of truth)
- Existing data in table will be lost (acceptable per clarification session)

**Migration Steps**:
1. Remove model from `app/models/user_followed_artist.py`
2. Remove imports from `app/models/__init__.py`
3. Run `python manage.py makemigrations` to generate removal migration
4. Run `python manage.py migrate` to apply

---

## Rate Limits

Spotify Web API has rate limits (not publicly documented exact numbers):
- Estimated ~100-200 requests per minute for normal use
- 429 response includes `Retry-After` header

**Mitigation**:
- Batch artist ID requests (up to 50 per call)
- Implement exponential backoff on 429 responses
- Background jobs should space out user processing

---

## Security Considerations

1. **Token Handling**: Access tokens must be passed securely via headers, never in URLs or logs
2. **Scope Validation**: Backend should verify token has required scopes before operations
3. **User Isolation**: Each user can only access their own followed artists (enforced by Spotify)
