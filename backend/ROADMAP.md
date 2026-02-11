# Backend Actionables Roadmap — Consolidated & Prioritized

> **Date:** 2026-02-07 · **Branch:** `develop`
> **Stack:** Django 5.2 · DRF 3.16 · Python 3.10+ · PostgreSQL
> **Source:** 5 expert reviews — Django, API Design, Error Handling, Performance, Clean Code

---

## How to read this document

Each item follows this format:

```
- [ ] **[ID]** Title
  **Files:** affected files with line numbers
  **Problem:** what's wrong and why it matters
  **Fix:** concrete action to take
```

Items are **deduplicated** across reviews. When the same issue was found by multiple reviews, the IDs from all reviews are listed (e.g., `2.5 / 24.1`).

---

## Priority: CRITICAL

> Fix immediately — active security vulnerabilities and bugs in production.

---

- [ ] **1.2** Remove stack trace from error responses
  **Files:** `app/exceptions/exceptions.py:31-39`
  **Problem:** `exception_response_dto` includes `traceback.format_exc()` in the JSON response sent to clients. This exposes file paths, code lines, and internal dependencies. An attacker can use this to plan targeted attacks.
  **Fix:** Remove the `stack_trace` field from the response dict. Log it internally with `logging.error(traceback.format_exc())` instead.

---

- [ ] **1.1** Remove `CORS_ALLOW_ALL_ORIGINS = True`
  **Files:** `trackwatch/settings.py:81`
  **Problem:** `CORS_ALLOW_ALL_ORIGINS = True` overrides the explicit `CORS_ALLOWED_ORIGINS` list (lines 75-79), making it useless. Combined with `CORS_ALLOW_CREDENTIALS = True`, any malicious site can make authenticated requests on behalf of users.
  **Fix:** Delete `CORS_ALLOW_ALL_ORIGINS = True`. Replace `CORS_ALLOW_HEADERS = ['*']` with an explicit list: `['X-Spotify-Access-Token', 'X-Spotify-Refresh-Token', 'X-Admin-Key', 'Content-Type']`.

---

- [ ] **2.1** Fix unreachable methods in User model (indentation bug)
  **Files:** `app/models/user.py:50-52`
  **Problem:** `get_full_name`, `get_short_name`, and `__str__` are indented inside `update_tokens`, making them local function definitions that are never called. The `User` model is missing its `__str__` and the required `AbstractBaseUser` methods.
  **Fix:** Dedent the three methods to class level (same indentation as `update_tokens`).

---

- [ ] **16.1 / 15.2 / 15.3** Overhaul exception handling in Spotify clients
  **Files:** All files in `app/clients/spotify/` (8 functions in `spotify_playlist_api_client.py`, 3 in `spotify_follow_api_client.py`, 3 in `spotify_artist_api_client.py`, 2 in `spotify_auth_api_client.py`), `app/clients/email/resend_client.py`
  **Problem:** Three interrelated issues found across all client files:
  1. **Bare `except Exception`** catches programming bugs (`TypeError`, `KeyError`, etc.) and masks them as "Error while calling Spotify API"
  2. **Missing `raise ... from e`** in all `raise InternalServerErrorException(...)` — original tracebacks are lost, making debugging extremely difficult
  3. **All Spotify errors map to 500** — a 401 (expired token), 404 (missing resource), or 429 (rate limit) from Spotify all return 500 to the frontend; the client cannot distinguish server bugs from user-side issues
  **Fix:**
  1. Catch specific exceptions (`requests.exceptions.HTTPError`, `Timeout`, `RequestException`) instead of `Exception`. Let `TypeError`/`KeyError`/etc. propagate with full traceback.
  2. Add `from e` to every `raise` that wraps another exception.
  3. Extract the HTTP status mapping logic from `get_spotify_user` into a reusable function:
  ```python
  def handle_spotify_api_error(e, context: str):
      if hasattr(e, "response") and hasattr(e.response, "status_code"):
          code = e.response.status_code
          if code == 401: raise UnauthorizedException(ErrorCode.SPOTIFY_INVALID_ACCESS_TOKEN) from e
          if code == 403: raise ForbiddenException(ErrorCode.SPOTIFY_FORBIDDEN_REQUEST) from e
          if code == 429: raise ExternalServiceError("Spotify rate limit exceeded") from e
      raise InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, context) from e
  ```
  Apply this function across all Spotify client modules.

---

## Priority: HIGH

> Fix soon — significant security, correctness, performance, or maintainability impact.

---

### Security

- [ ] **1.4** Separate `SECRET_KEY` from admin API key
  **Files:** `app/views/actions_view.py:35`
  **Problem:** The Django `SECRET_KEY` is reused as the admin credential for the `update_new_releases` endpoint. If leaked (via stack trace, logs), both admin auth and Django's cryptographic security (sessions, CSRF, signing) are compromised.
  **Fix:** Create a separate `ADMIN_API_KEY` environment variable. Update the check to `config("ADMIN_API_KEY")`.

- [ ] **4.1** Remove `ALLOWED_HOSTS = "*"` default
  **Files:** `trackwatch/settings.py:9`
  **Problem:** `ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="*").split(",")` accepts any Host header by default, enabling HTTP Host header injection attacks.
  **Fix:** Remove the default so it fails if not configured: `ALLOWED_HOSTS = config("ALLOWED_HOSTS").split(",")`.

- [ ] **4.2** Add security headers for production
  **Files:** `trackwatch/settings.py`
  **Problem:** No HSTS, no SSL redirect, no content-type sniffing protection, no secure cookies.
  **Fix:** Add to `settings.py` (conditioned on `not DEBUG`):
  ```python
  SECURE_SSL_REDIRECT = not DEBUG
  SECURE_HSTS_SECONDS = 31536000
  SECURE_HSTS_INCLUDE_SUBDOMAINS = True
  SECURE_HSTS_PRELOAD = True
  SESSION_COOKIE_SECURE = not DEBUG
  CSRF_COOKIE_SECURE = not DEBUG
  SECURE_CONTENT_TYPE_NOSNIFF = True
  ```
  Run `python manage.py check --deploy` and address all warnings.

---

### Performance (latency multipliers)

- [ ] **2.5 / 24.1** Fix N+1 queries in `is_track_recently_added` (~3,000 queries/user)
  **Files:** `app/services/track_service.py:166-168`, `app/services/search_followed_releases_use_case.py:64-89`
  **Problem:** `is_track_recently_added` is called once per track inside `filter_track`. Each call executes `user.recently_added_tracks.all()` — a new DB query. With 20 artists × 150 tracks = ~3,000 queries per user, all returning the same data.
  **Fix:** Pre-load recently added track IDs once per user:
  ```python
  # In find_new_releases_for_user:
  recently_added_ids = set(user.recently_added_tracks.values_list('track_id', flat=True))
  # Pass to filter_track; check: track.id in recently_added_ids  → O(1), 0 queries
  ```

- [ ] **25.1** Use `requests.Session` for Spotify API calls (stop creating new TCP connections per request)
  **Files:** `app/clients/spotify/spotify_api_client.py:10-18, 20-51`
  **Problem:** `get_spotify_api_session()` and `get_spotify_auth_session()` are defined but never used. `spotify_api_request` uses `requests.request()` directly, creating a new TCP socket + TLS handshake for every call. In the scheduler flow: 20 artists × 3 pages = 60 calls → ~6 seconds wasted on TLS handshakes alone per user.
  **Fix:** Use a module-level `requests.Session` (or pass per-thread sessions for thread safety):
  ```python
  _api_session = requests.Session()
  _api_session.headers.update({"Content-Type": "application/json"})

  def spotify_api_request(method, endpoint, token=None, ...):
      if token:
          _api_session.headers["Authorization"] = f"Bearer {token}"
      response = _api_session.request(method, url, ...)
  ```
  Remove the unused `get_spotify_api_session` and `get_spotify_auth_session` functions.

- [ ] **2.6 / 23.1** Fix O(n²) in `select_track` with linear list search
  **Files:** `app/services/track_service.py:144-158`
  **Problem:** `select_track` scans the entire `tracks_to_add` list with `[t for t in tracks_to_add if t.is_equal_to(track)]` for every track. Each `is_equal_to` call also sorts both artist lists (see 23.2). For 150 tracks: ~11,250 comparisons with expensive inner operations.
  **Fix:** Use a dict index for O(1) lookup:
  ```python
  track_index = {}  # key: name.lower() → list[Track]
  def select_track(track, tracks_to_add, track_index):
      key = track.name.lower()
      candidates = track_index.get(key, [])
      equal_track = next((t for t in candidates if t.is_equal_to(track)), None)
  ```

---

### Error Handling

- [ ] **20.1** Replace generic `UNHANDLED_EXCEPTION` with specific error codes
  **Files:** `app/exceptions/exceptions.py:17-28`, all client files in `app/clients/`
  **Problem:** `ErrorCode.UNHANDLED_EXCEPTION` is used as a catch-all in ~15 different functions. Logs show identical error codes for completely different failures — impossible to know which function failed, with what parameters, or in what context.
  **Fix:** Create specific error codes for each failure type:
  ```python
  SPOTIFY_ARTIST_FETCH_FAILED = ErrorCodeDef("SPOTIFY_ARTIST_FETCH_FAILED", "Failed to fetch artist info")
  SPOTIFY_SEARCH_FAILED = ErrorCodeDef("SPOTIFY_SEARCH_FAILED", "Failed to search tracks")
  SPOTIFY_PLAYLIST_CREATE_FAILED = ErrorCodeDef("SPOTIFY_PLAYLIST_CREATE_FAILED", "Failed to create playlist")
  EMAIL_SEND_FAILED = ErrorCodeDef("EMAIL_SEND_FAILED", "Failed to send email")
  ```

- [ ] **19.1** Unify the two parallel error handling systems
  **Files:** `app/exceptions/middleware.py`, `app/views/ghost_tracks_view.py:49-56,86-104,133-156`
  **Problem:** Two completely separate error handling systems exist: (1) `GlobalExceptionMiddleware` catches `CustomException` subclasses, returns `{status, code, message, details, timestamp}`; (2) `ghost_tracks_view.py` catches `Exception` directly in each view, returns `{"error": str(e)}`. Ghost track errors never pass through the middleware, have a different format, and bypass any logging/auditing.
  **Fix:** Remove all `try/except Exception` blocks from `ghost_tracks_view.py`. Let exceptions propagate to the global middleware. Raise `CustomException` subclasses from `ghost_tracks_service.py` instead of returning `Response` with errors.

- [ ] **18.1** Consolidate three different retry implementations into one
  **Files:** `spotify_api_client.py:26` (3 retries, exponential backoff, 429 only), `spotify_artist_api_client.py:21` (5 retries, linear backoff, Timeout+Exception), `spotify_auth_api_client.py:6` (3 retries, linear backoff, Exception)
  **Problem:** Three separate retry patterns with different max attempts, different backoff strategies, and different exception handling. `spotify_api_request` already retries 429s, but `search_artist_tracks_with_retries` also retries, potentially causing 5 × 4 = 20 attempts for a single request.
  **Fix:** Create a reusable `@retry` decorator:
  ```python
  def retry(max_attempts=3, backoff_factor=2.0, retryable_exceptions=(RequestException,)):
      def decorator(func):
          @wraps(func)
          def wrapper(*args, **kwargs): ...
          return wrapper
      return decorator
  ```
  Apply it in all three places. Decide whether `spotify_api_request` handles 429 internally OR callers retry — not both.

- [ ] **16.2** Remove double exception wrapping in `search_artist_tracks`
  **Files:** `app/clients/spotify/spotify_artist_api_client.py:44-60, 21-42`
  **Problem:** `search_artist_tracks` catches `Exception` and wraps it in `InternalServerErrorException`. Then `search_artist_tracks_with_retries` catches that `InternalServerErrorException` as `Exception` and re-wraps it. The original error info is destroyed.
  **Fix:** Remove the try/except from `search_artist_tracks`. Let exceptions propagate to `search_artist_tracks_with_retries`, which should be the only place deciding how to handle errors.

- [ ] **21.2** Add error handling for daemon thread
  **Files:** `app/views/actions_view.py:39-44`
  **Problem:** If `update_new_releases_for_all_users` throws an uncaught exception (e.g., DB connection failure before the user loop), the daemon thread dies silently. No logging, no alert.
  **Fix:** Wrap the thread target:
  ```python
  def safe_update(days_limit):
      try:
          update_new_releases_for_all_users(days_limit)
      except Exception:
          logger.exception("Background release update failed")
  thread = threading.Thread(target=safe_update, args=(days_limit,), daemon=True)
  ```

---

### API Design

- [ ] **9.1 / 9.2** Define a standard response envelope and consistent key naming convention
  **Files:** All view files in `app/views/`
  **Problem:** Every endpoint returns a different structure. Two different error formats exist (middleware vs ghost_tracks). Some keys are `snake_case` (user endpoints: `playlist_id`, `image_url`), others are `camelCase` (actions: `playlistId`, `artistImageUrl`; ghost_tracks: `ghostTracks`, `scanDurationMs`). The error middleware uses `snake_case` (`stack_trace`).
  **Fix:** Choose one convention (recommended: `camelCase` for JSON APIs consumed by JavaScript). Define standard envelopes:
  ```json
  // Success:  { "data": { ... } }
  // Error:    { "error": { "code": "...", "message": "..." } }
  ```
  Apply consistently across all endpoints.

- [ ] **11.1-11.4** Add input validation to all views
  **Files:** `app/views/actions_view.py:12-18,33`, `app/views/artists_view.py:14-16,31-33`
  **Problem:** No parameter is validated before being passed to business logic. Missing `userId`, `artistId`, or `access_token` causes opaque 500 errors from inner layers. `json.loads(request.body)` without try/except causes 500 on malformed JSON. `int(days_limit)` without validation causes 500 on non-numeric input.
  **Fix:** Add explicit validation at the start of each view. Return `400 Bad Request` with a clear message for missing or invalid fields. Wrap `json.loads` in try/except returning `BadRequestException(ErrorCode.INVALID_REQUEST_BODY)`.

- [ ] **10.1** Return 404 (not 400) for user not found
  **Files:** `app/views/users_view.py:53`
  **Problem:** `User.DoesNotExist` raises `BadRequestException` (400) instead of `NotFoundException` (404). A missing resource should be 404, not 400.
  **Fix:** Change to `raise NotFoundException(ErrorCode.USER_NOT_FOUND)`.

- [ ] **10.3** Return 202 (not 200) for async operations
  **Files:** `app/views/actions_view.py:46`
  **Problem:** `update_new_releases` launches a background thread and returns immediately with 200. The correct status for "accepted but not yet processed" is `202 Accepted`.
  **Fix:** `return JsonResponse({...}, status=202)`.

---

### Clean Code

- [ ] **31.5 / 34.6** Extract reusable pagination helper and replace wildcard imports
  **Files:** `app/clients/spotify/spotify_playlist_api_client.py` (4 functions), all `__init__.py` files, `generate_artist_playlist_use_case.py:1`, `search_followed_releases_use_case.py:2-5`, `middleware.py:4`
  **Problem:** (a) Four functions in `spotify_playlist_api_client.py` copy-paste the same ~20-line pagination loop with minor variations. (b) Six `__init__.py` files and several modules use `from .module import *`, making it impossible to trace symbol origins and causing potential name collisions.
  **Fix:**
  (a) Extract a generic paginator:
  ```python
  def paginate_spotify(endpoint, token, params=None, limit=50):
      offset = 0
      base_params = params or {}
      while True:
          base_params.update({"limit": limit, "offset": offset})
          response = spotify_api_request("GET", endpoint, token=token, params=base_params)
          yield from response.get("items", [])
          offset += limit
          if offset >= response.get("total", 0): break
  ```
  (b) Replace all `from .module import *` with explicit imports.

- [ ] **33.4** Add `status_code` attribute to exception classes to eliminate isinstance chain
  **Files:** `app/exceptions/exceptions.py:4-15`, `app/exceptions/middleware.py:7-28`
  **Problem:** The middleware uses a 6-branch `isinstance` chain to determine status codes. Each exception should know its own status code.
  **Fix:**
  ```python
  class CustomException(Exception):
      status_code = 500
  class BadRequestException(CustomException):
      status_code = 400
  class UnauthorizedException(CustomException):
      status_code = 401
  # etc.
  ```
  Simplify middleware to: `status = exception.status_code if isinstance(exception, CustomException) else 500`.

- [ ] **30.3 / 33.1** Refactor `filter_track` — split SRP violation and reduce 8 arguments
  **Files:** `app/services/track_service.py:26-59`
  **Problem:** `filter_track` takes 8 arguments (5 boolean flags), and combines evaluation, selection, and list mutation in one function. Each flag combination is effectively a different function. The function also mutates `tracks_to_add` as a side effect.
  **Fix:** Split into focused functions:
  ```python
  def should_include_track(track, user, artist, days_limit, config: TrackFilterConfig) -> bool:
      """Pure predicate — no side effects."""
  def add_or_replace_track(track, tracks_to_add, track_index):
      """Manages the tracks list — explicit mutation."""
  ```
  Use a `@dataclass` for the 5 boolean flags:
  ```python
  @dataclass
  class TrackFilterConfig:
      check_correct_artist: bool = True
      check_time_range: bool = True
      check_compilation: bool = True
      check_blocked: bool = True
      check_recently_added: bool = False
  ```

- [ ] **31.1** Extract shared "find user, validate token" pattern
  **Files:** `app/services/artist_service.py:14-19,28-33`, `app/services/generate_artist_playlist_use_case.py:25-31`
  **Problem:** The same 3-line block (find user → check None → validate token) is copy-pasted in 3 places.
  **Fix:** Reuse the existing `retrieve_and_validate_user` (rename to `get_authenticated_user`) from all three call sites.

---

## Priority: MEDIUM

> Improves reliability, readability, and developer experience. Plan for next iteration.

---

### Performance

- [ ] **2.7 / 23.3** Convert `filter_uris_not_in_playlist` to use set instead of list
  **Files:** `app/services/playlist_service.py:58-60`
  **Problem:** `uri not in tracks_in_playlist` is O(m) per URI when `tracks_in_playlist` is a list. For 500 playlist tracks and 50 new URIs: 25,000 comparisons.
  **Fix:** `tracks_in_playlist = set(get_playlist_tracks(user, playlist_id))` — reduces to O(1) per lookup.

- [ ] **23.4** Convert `filter_tracks_by_uris` to use set instead of list
  **Files:** `app/services/playlist_service.py:65-66`
  **Problem:** Same issue as above. `track.uri in uris` is O(m) when `uris` is a list.
  **Fix:** `uri_set = set(uris)` then use `track.uri in uri_set`.

- [ ] **25.2** Replace full playlist pagination with direct GET for existence check
  **Files:** `app/clients/spotify/spotify_playlist_api_client.py:90-114`
  **Problem:** `check_playlist_exists` paginates through ALL user playlists to find one ID. A user with 200 playlists requires 4 API calls. Spotify's API supports `GET /playlists/{id}` directly.
  **Fix:** `spotify_api_request("GET", f"/playlists/{user.playlist_id}", token=...)` — returns 200 if exists, 404 if not. One call instead of N.

- [ ] **24.3** Use `bulk_create` instead of individual INSERTs per track
  **Files:** `app/services/search_followed_releases_use_case.py:95-104`
  **Problem:** Each `UserRecentlyAddedTrack.objects.create()` is a separate INSERT + commit. For 30 new tracks: 30 DB round-trips.
  **Fix:**
  ```python
  records = [UserRecentlyAddedTrack(user=user, track_id=t.id, track_name=t.name, track_added_at=timezone.now()) for t in added_tracks]
  UserRecentlyAddedTrack.objects.bulk_create(records)
  ```

- [ ] **28.1** Parallelize user processing in the scheduler
  **Files:** `app/services/search_followed_releases_use_case.py:11-26`
  **Problem:** Each user is processed sequentially. With 10 users × 60 Spotify API calls × ~500ms each = ~5 minutes. The bottleneck is I/O (waiting for Spotify responses).
  **Fix:** Use `ThreadPoolExecutor(max_workers=3)` (the project already uses this pattern in `ghost_tracks_service.py`). Limit workers to respect Spotify rate limits.

- [ ] **23.2** Pre-compute artist ID sets instead of sorting on every comparison
  **Files:** `app/classes/track.py:49-54`
  **Problem:** `_is_equal_artists` sorts both artist lists on every `is_equal_to` call. With 11,250 comparisons in `select_track`, that's 22,500 sorts.
  **Fix:** Pre-compute in the `Track` constructor: `self._artist_ids = frozenset(a.id for a in artists)`. Compare with `self._artist_ids == other._artist_ids`.

- [ ] **26.1 / 26.3** Cache timezone object and stop mutating Track in `is_track_in_time_range`
  **Files:** `app/services/track_service.py:38, 104-109`
  **Problem:** `pytz.timezone(System.SERVER_TIMEZONE)` is instantiated per track call (~3,000 times). `is_track_in_time_range` mutates the Track object to add tzinfo as a side effect.
  **Fix:** Cache at module level: `_SERVER_TZ = pytz.timezone(System.SERVER_TIMEZONE)`. Better: use `zoneinfo.ZoneInfo` (stdlib Python 3.9+). Assign timezone in `parse_tracks` when creating Track objects, not during filtering.

- [ ] **24.4** Add `CONN_MAX_AGE` for PostgreSQL connection reuse
  **Files:** `trackwatch/settings.py:39-48`
  **Problem:** Django creates and destroys a PostgreSQL connection per HTTP request. No `CONN_MAX_AGE` configured.
  **Fix:** Add `"CONN_MAX_AGE": 600` to the database config. For production with multiple Gunicorn workers, consider PgBouncer.

- [ ] **24.2 / 2.3** Move `is_staff` filter from Python to SQL query
  **Files:** `app/services/user_service.py:10-13`
  **Problem:** Loads all users with `updates_enabled=True`, then filters `is_staff` in Python.
  **Fix:** `User.objects.filter(updates_enabled=True, is_staff=False)`.

---

### Error Handling

- [ ] **17.4** Stop silencing Spotify errors as empty artist list
  **Files:** `app/services/user_service.py:78-83`
  **Problem:** If the Spotify API fails when fetching followed artists, the user gets a 200 response with `followed_artists: []` — indistinguishable from "follows nobody".
  **Fix:** Either propagate the error, or include a warning field: `{"followed_artists": [], "warnings": ["Could not fetch followed artists"]}`.

- [ ] **17.1** Log (don't silence) playlist cover update errors
  **Files:** `app/clients/spotify/spotify_playlist_api_client.py:116-127`
  **Problem:** `update_playlist_cover` catches all exceptions and prints them. The caller never knows it failed.
  **Fix:** Use `logging.warning()` instead of `print`. Document why it's acceptable to silence this error (if it is).

- [ ] **19.2** Fix double exception wrapping in `format_release_date`
  **Files:** `app/clients/spotify/spotify_artist_api_client.py:90-112`
  **Problem:** The `else` clause inside the `try` block raises `InternalServerErrorException`, which is immediately caught by the same `except Exception` block and wrapped in another `InternalServerErrorException`.
  **Fix:** Use `except ValueError` instead of `except Exception`, or move the `else` validation outside the try block.

- [ ] **20.2** Fix unsafe `.details` access in `refresh_access_token_with_retries`
  **Files:** `app/clients/spotify/spotify_auth_api_client.py:13`
  **Problem:** `e.details` is accessed without checking if the attribute exists. If `e` is a `ConnectionError`, this raises `AttributeError` that gets caught by the same `except Exception`, hiding the original error.
  **Fix:** Use `getattr(e, 'details', str(e))`.

- [ ] **21.1** Handle exceptions from futures in `scan_playlists_parallel`
  **Files:** `app/services/ghost_tracks_service.py:108-110`
  **Problem:** `future.result()` re-raises exceptions from the thread. If an unexpected error escapes, it stops processing of remaining completed futures.
  **Fix:** Wrap `future.result()` in try/except and include the error in the result dict.

---

### API Design

- [ ] **8.1-8.3** Move business parameters from query string to body/URL path
  **Files:** `app/views/actions_view.py:13-15`, `app/views/artists_view.py:13-16,31-33`
  **Problem:** POST endpoints receive their main parameters via query string (`?userId=&artistId=`). `follow_artist` mixes query params with body. `unfollow_artist` is a POST with no body.
  **Fix:** Move all business data to the request body (or URL path parameters if migrating to REST-style URLs per item 7.1-7.3).

- [ ] **7.1-7.3** Migrate action-oriented URLs to resource-oriented REST
  **Files:** `app/constants.py:8-22`, `app/views/actions_view.py`, `app/views/artists_view.py`, `app/views/ghost_tracks_view.py`
  **Problem:** URLs contain verbs (`/actions/generate`, `/artists/follow`, `/ghost-tracks/scan`). REST models resources as nouns and uses HTTP verbs for actions.
  **Fix:** Proposed REST mapping:
  | Current | Proposed | HTTP Verb |
  |---------|----------|-----------|
  | `POST /actions/generate?userId=&artistId=` | `POST /users/{userId}/artists/{artistId}/playlist` | POST |
  | `POST /artists/follow?userId=` | `PUT /users/{userId}/followed-artists/{artistId}` | PUT |
  | `POST /artists/unfollow?userId=&artistId=` | `DELETE /users/{userId}/followed-artists/{artistId}` | DELETE |
  | `POST /ghost-tracks/remove` | `DELETE /ghost-tracks` | DELETE |
  Evaluate if the breaking change is justified. If not, document the RPC style choice.

- [ ] **10.2** Return correct status codes for follow/unfollow
  **Files:** `app/views/artists_view.py:25,37`
  **Problem:** Both return default 200. `follow_artist` creates a relationship (should be 201). `unfollow_artist` deletes one (could be 204).
  **Fix:** `follow_artist`: `status=201`. `unfollow_artist`: `status=200` with updated list or `status=204`.

- [ ] **12.1-12.2** Use idempotent HTTP verbs for idempotent operations
  **Files:** `app/views/artists_view.py`, `app/views/ghost_tracks_view.py`
  **Problem:** Following an artist twice produces the same state (idempotent) but uses POST (non-idempotent by convention). Removing ghost tracks is destructive but not idempotent.
  **Fix:** Migrate follow to PUT, unfollow to DELETE (see 7.2). Ensure ghost track removal is idempotent (don't fail if track already removed).

---

### Clean Code

- [ ] **30.1** Split `scan_playlist_for_ghost_tracks` (60-line, 7 responsibilities)
  **Files:** `app/services/ghost_tracks_service.py:30-89`
  **Problem:** One function does API call, iteration, validation, evaluation, data extraction, formatting, and error handling.
  **Fix:** Extract `_build_ghost_track(track, playlist_id, playlist_name)` for evaluating individual tracks.

- [ ] **30.2 / 2.2** Remove hidden `.save()` side effect from `update_tokens`
  **Files:** `app/models/user.py:43-48`, `app/views/users_view.py:57-58`
  **Problem:** `update_tokens` calls `self.save()` internally. Callers don't expect a field setter to persist to DB, causing the double-save bug in `toggle_playlist_updates`.
  **Fix:** Remove `.save()` from `update_tokens`. Let callers call `.save()` explicitly when ready.

- [ ] **32.2** Rename misleading functions
  **Files:** Various
  **Problem:** Several function names don't match what they do:
  | Function | Returns | Better Name |
  |----------|---------|-------------|
  | `save_user` | `self` after `.save()` | Remove; use `.save()` directly |
  | `get_valid_access_token` | `User` object | `refresh_user_token` |
  | `get_user_with_valid_token` | Wrapper calling above | Remove; call directly |
  | `find_equal_track_in_list` | `Track` or `None` (typed as `-> bool`) | Fix type hint to `-> Optional[Track]` |
  **Fix:** Rename or remove as specified.

- [ ] **31.3** Extract shared email template layout
  **Files:** `app/utils/email_helper.py:40-213`
  **Problem:** Three email templates repeat the same `<style>` block (7 CSS rules), the same `header → content → footer` structure, and the same copyright footer.
  **Fix:** Extract `_email_layout(title, subtitle, content_html, year)` function.

- [ ] **36.1** Move admin key validation to top of `update_new_releases` (guard clause)
  **Files:** `app/views/actions_view.py:29-36`
  **Problem:** Authorization happens after parsing `daysLimit`. No point parsing parameters if the request isn't authorized.
  **Fix:** Move the admin key check before any parameter parsing.

- [ ] **36.2** Simplify `collect_artist_tracks` loop condition
  **Files:** `app/services/generate_artist_playlist_use_case.py:33-54`
  **Problem:** `while True` with a compound exit condition mixing 3 checks and a side-effect function (`add_tracks_to_findings` mutates `findings`).
  **Fix:** Use `for page in range(System.MAX_LOOP_ITERATION + 1)` with early `break` guard clauses.

- [ ] **33.2** Remove `print()` calls mixed into high-level orchestration functions
  **Files:** `app/services/generate_artist_playlist_use_case.py:10,18`, ~20 instances across the codebase
  **Problem:** `print()` statements mixed into business logic break abstraction levels and produce unstructured output in production.
  **Fix:** Replace all `print()` with `logging.getLogger(__name__)` at appropriate levels (also covers item 4.3).

- [ ] **35.3** Extract magic numbers as named constants
  **Files:** `spotify_playlist_api_client.py` (50, 100), `ghost_tracks_service.py` (3, 100), `spotify_artist_api_client.py` (50)
  **Problem:** Pagination limits, batch sizes, and worker counts are hardcoded integers.
  **Fix:** Add to `constants.py`:
  ```python
  class Spotify:
      PAGINATION_LIMIT = 50
      MAX_TRACKS_PER_REQUEST = 100
      GHOST_TRACKS_MAX_WORKERS = 3
  ```

---

## Priority: LOW

> Nice-to-have improvements. Schedule when convenient.

---

### Architecture & Django

- [ ] **3.1** Standardize on DRF or vanilla Django views (not both)
  **Files:** All view files, `trackwatch/settings.py:50-58`
  **Fix:** Migrate all views to `@api_view` for consistent auth/permissions, or remove `REST_FRAMEWORK` config.

- [ ] **3.4** Create DRF serializers for User and API responses
  **Files:** `app/services/user_service.py:62-93`
  **Fix:** Especially useful if views migrate to DRF.

- [ ] **3.3** Delete duplicate scheduler management command
  **Files:** `app/management/commands/runapscheduler.py`
  **Fix:** Remove `runapscheduler.py`; keep `run_scheduler.py`.

- [ ] **3.5** Add unit and integration tests
  **Files:** No test files exist
  **Fix:** Start with `track_service.py` and `user_service.py` unit tests. Add integration tests for views with Spotify API mocks.

- [ ] **1.3** Decide and document authentication strategy
  **Files:** All view files, `trackwatch/settings.py`
  **Fix:** If token-based, remove `SessionAuthentication` from DRF config. If ghost_tracks endpoints are intentionally public, document why.

- [ ] **1.5** Evaluate token encryption at rest
  **Files:** `app/models/user.py:16-19`
  **Fix:** Consider `django-encrypted-model-fields` or `django-fernet-fields`. At minimum, document the risk.

- [x] **4.4** Lazy-load `resend.api_key` configuration
  **Files:** `app/clients/email/resend_client.py:7`
  **Fix:** Move `resend.api_key = config("RESEND_API_KEY")` inside a function to prevent import-time failures.

- [ ] **4.5** Replace daemon thread with a task queue
  **Files:** `app/views/actions_view.py:39-44`
  **Fix:** Consider Celery or django-rq for background processing with retries and monitoring.

---

### Performance

- [ ] **27.1** Add `__slots__` to `Track`, `Artist`, `TrackImage`
  **Files:** `app/classes/track.py`, `app/classes/artist.py`
  **Fix:** Add `__slots__` or use `@dataclass(slots=True)`. ~21,000 instances per user run will use 40-60% less memory.

- [ ] **27.2** Remove unnecessary `list()` wrapper around `sort_tracks`
  **Files:** `app/services/search_followed_releases_use_case.py:72`
  **Fix:** `return sort_tracks(new_releases)` — `sorted()` already returns a list.

- [ ] **27.3** Remove unnecessary `list()` copy in playlist chunk loop
  **Files:** `app/services/playlist_service.py:32`
  **Fix:** `chunk = track_uris[i:i+100]` — slicing a list already works, no need to copy.

- [ ] **29.1** Document or replace hardcoded `time.sleep(3)` in `update_playlist_cover`
  **Files:** `app/services/playlist_service.py:48`
  **Fix:** Add a comment explaining why the sleep exists. Consider retry with backoff instead.

- [ ] **29.2 / 25.3** Remove redundant 2.5s polling in `check_playlist_exists_with_retries`
  **Files:** `app/clients/spotify/spotify_playlist_api_client.py:83-88,90-114,147-176`
  **Fix:** If 25.2 is implemented (direct GET), the retry loop becomes unnecessary. Also eliminates code duplication between `check_playlist_exists` and `get_user_playlists`.

- [ ] **26.2** Move track selection rules to module level
  **Files:** `app/services/track_service.py:117-142`
  **Fix:** Declare `_TRACK_SELECTION_RULES` at module level instead of recreating 4 dicts + 8 lambdas per call.

- [ ] **26.4** Move `import time` to top of file
  **Files:** `app/clients/spotify/spotify_artist_api_client.py:37`
  **Fix:** Move `import time` to the module's import section.

---

### Error Handling

- [ ] **15.1** Replace `ErrorCode` tuples with a typed structure
  **Files:** `app/exceptions/exceptions.py:17-28`
  **Fix:** Use a `@dataclass(frozen=True)` with `.code` and `.message` fields instead of tuple indexing (`error_code[0]`, `error_code[1]`).

- [ ] **17.2** Log email send failures properly
  **Files:** `app/clients/email/resend_client.py:9-15`
  **Fix:** Replace `print(f"Failed to send admin email: ...")` with `logging.error(...)` including full traceback.

- [ ] **17.3** Fix return type hint on `encode_image_to_base64`
  **Files:** `app/utils/image_helper.py:4`
  **Fix:** Change `-> str` to `-> Optional[str]`, or raise the exception instead of returning None.

- [ ] **18.2** Distinguish "not found" from "API error" in `check_playlist_exists_with_retries`
  **Files:** `app/clients/spotify/spotify_playlist_api_client.py:83-88`
  **Fix:** Catch transient exceptions inside the retry loop. Add logging to differentiate "not found yet" from "API error".

- [ ] **22.1** Consider a circuit breaker for the Spotify API
  **Files:** `app/clients/spotify/spotify_api_client.py`
  **Fix:** If Spotify is consistently failing, stop making requests for a cooldown period instead of retrying every call for every user.

---

### Clean Code

- [ ] **34.2** Remove `save_user` wrapper
  **Files:** `app/models/user.py:35-37`
  **Fix:** Replace all `user.save_user()` calls with `user.save()`.

- [ ] **34.3** Remove `get_user_with_valid_token` one-line wrapper
  **Files:** `app/services/search_followed_releases_use_case.py:61-62`
  **Fix:** Call `get_valid_access_token(user)` directly.

- [ ] **34.4** Remove `get_user_followed_artists` one-line wrapper
  **Files:** `app/services/artist_service.py:6-11`
  **Fix:** Call `get_followed_artists(access_token)` directly if this function adds no value.

- [ ] **34.5** Remove unused `collect_playlist_items` and `all_playlists` accumulator
  **Files:** `app/clients/spotify/spotify_playlist_api_client.py:90-114,129-135`
  **Fix:** `check_playlist_exists` calls `collect_playlist_items` to build `all_playlists`, but never reads the list. Remove both.

- [ ] **31.2** Unify `send_email` and `send_admin_email`
  **Files:** `app/clients/email/resend_client.py:9-24`
  **Fix:** Single function with `raise_on_error` parameter.

- [ ] **31.4** Extract `_get_playlist_name_map` helper in ghost_tracks_view
  **Files:** `app/views/ghost_tracks_view.py:88-89,135-136`
  **Fix:** Shared helper for the repeated `get_owned_playlists → dict comprehension` pattern.

- [ ] **33.3** Use guard clause in `create_or_update_playlist`
  **Files:** `app/services/generate_artist_playlist_use_case.py:78-85`
  **Fix:** Guard clause at top to avoid computing `playlist_name`/`playlist_description` when `existing_playlist_id` exists.

- [ ] **35.1** Remove ~10 comments that just repeat the next line of code
  **Files:** `app/services/artist_service.py:22,25,36,39`, `app/views/ghost_tracks_view.py:68,72,87,116,119`, `app/services/search_followed_releases_use_case.py:67`
  **Fix:** Delete them. Keep only comments that explain **why**.

- [ ] **35.2** Remove ~7 docstrings that paraphrase the function name
  **Files:** `app/clients/spotify/spotify_follow_api_client.py:6,55,73`, `app/views/legal_view.py:22,32,49`, `app/views/ghost_tracks_view.py:19`
  **Fix:** Delete docstrings that only restate the function name.

- [ ] **32.1** Rename single-letter and abbreviated variables
  **Files:** `ghost_tracks_view.py:93-94` (`pid`, `p`), `spotify_playlist_api_client.py:58` (`id_`), `spotify_artist_api_client.py:136,140` (`q`, `type_`), `spotify_auth_api_client.py:38` (`resp`)
  **Fix:** Rename to descriptive names (`playlist_id`, `playlist`, `track_id`, `search_query`, `response`).

- [ ] **32.3** Rename booleans to question form
  **Files:** `app/constants.py:47` (`DEFAULT_PRIVACY`), `app/models/user.py:21` (`setting_blocked_explicit_content`)
  **Fix:** `IS_PUBLIC_BY_DEFAULT`, `blocks_explicit_content`.

- [ ] **37.1** Remove unused `create_from_spotify_dto` method
  **Files:** `app/models/managers/user_manager.py:28-39`
  **Fix:** Never called. Delete it or use it in `register_user`.

- [ ] **37.2** Remove or fix `UserRecentlyAddedTrack.is_equal_to_track`
  **Files:** `app/models/user_recently_added_track.py:16-18`
  **Fix:** Expects a `dict` but is never called with one. Verify usage and remove if dead code.

---

### Minor Fixes

- [ ] **5.1** Fix typo in `entrypoint.sh:43` — remove trailing `gca`
- [ ] **5.2** Migrate `unique_together` to `UniqueConstraint` in `UserRecentlyAddedTrack.Meta`
- [ ] **5.5** Remove unused import `from django.db import models` in `user_manager.py:1`
- [ ] **2.4** Remove redundant `updates_enabled` check in `update_new_releases_for_all_users` loop
- [ ] **13** Consider API versioning (`/api/v1/...`) — may not be needed if frontend deploys with backend
- [ ] **14** Consider adding DRF throttling for rate limiting (requires migrating views to DRF first)

---

## Summary

| Priority | Count | Focus Areas |
|----------|-------|-------------|
| **Critical** | 4 | Stack trace exposure, CORS bypass, User model bug, Exception handling overhaul |
| **High** | 17 | Security headers, N+1 queries, TCP connection reuse, O(n²) algorithm, Error codes, Retry consolidation, Response format, Input validation |
| **Medium** | 25 | Set lookups, bulk_create, pagination helper, parallel scheduling, timezone caching, function SRP, naming, magic numbers |
| **Low** | 30 | Slots, dead code removal, wrapper elimination, comment cleanup, minor fixes |
| **Total** | **76** | |
