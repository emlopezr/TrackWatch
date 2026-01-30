# Quickstart: Spotify Artists Sync

**Feature**: 001-spotify-artists-sync
**Date**: 2026-01-29

## Prerequisites

1. **Spotify Developer Account**: Access to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. **Updated OAuth Scopes**: Application must request `user-follow-read` and `user-follow-modify` scopes
3. **Development Environment**: Backend and frontend running locally

## Setup Steps

### 1. Update Spotify OAuth Scopes

Add the new scopes to your Spotify OAuth authorization URL:

```
https://accounts.spotify.com/authorize?
  client_id=YOUR_CLIENT_ID&
  response_type=code&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=user-follow-read user-follow-modify [existing scopes]
```

**Location to update**: Check frontend OAuth configuration (likely in `spotifyAuth.ts` or environment variables).

### 2. Re-authenticate

After updating scopes, log out and log back in to grant the new permissions.

### 3. Backend Setup

```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Run migrations (after implementation)
python manage.py migrate

# Start server
python manage.py runserver
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Start dev server
npm run dev
```

## Verification Steps

### Test 1: View Followed Artists

1. Log in to TrackWatch
2. Navigate to the followed artists view
3. Verify your Spotify followed artists are displayed
4. Compare with Spotify app to confirm accuracy

### Test 2: Follow Artist

1. Search for an artist you don't follow
2. Click the follow button
3. Verify the UI updates to show "followed"
4. Open Spotify app and confirm the artist appears in your followed list

### Test 3: Unfollow Artist

1. View an artist you currently follow
2. Click the unfollow button
3. Verify the UI updates to show "not followed"
4. Open Spotify app and confirm the artist is no longer in your followed list

### Test 4: Background Job (if applicable)

1. Trigger the release detection job manually:
   ```bash
   python manage.py shell
   >>> from app.services.search_followed_releases_use_case import update_new_releases_for_all_users
   >>> update_new_releases_for_all_users()
   ```
2. Verify it fetches artists from Spotify API (check logs)
3. Verify new releases are detected correctly

## Troubleshooting

### "Forbidden" Error on Follow/Unfollow

**Cause**: Missing `user-follow-modify` scope.
**Solution**: Re-authenticate with updated scopes.

### Empty Artist List

**Cause**: Missing `user-follow-read` scope or token expired.
**Solution**: Check token validity, re-authenticate if needed.

### 401 Unauthorized Errors

**Cause**: Access token expired.
**Solution**: Token refresh should happen automatically. If not, check `useTokenManager` hook.

### Rate Limit (429) Errors

**Cause**: Too many API requests.
**Solution**: Wait for `Retry-After` period. Consider adding delays between batch operations.

## API Testing with cURL

### Get Followed Artists
```bash
curl -X GET "https://api.spotify.com/v1/me/following?type=artist&limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Follow an Artist
```bash
curl -X PUT "https://api.spotify.com/v1/me/following?type=artist&ids=ARTIST_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Unfollow an Artist
```bash
curl -X DELETE "https://api.spotify.com/v1/me/following?type=artist&ids=ARTIST_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Rollback Plan

If issues arise after deployment:

1. **Revert code changes**: `git revert HEAD`
2. **Restore database table**: Run reverse migration
3. **Re-deploy previous version**

Note: Data in `UserFollowedArtist` table will be lost after migration. Spotify remains the source of truth, so no user data is actually lost.
