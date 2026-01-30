# Feature Specification: Spotify Artists Sync

**Feature Branch**: `001-spotify-artists-sync`
**Created**: 2026-01-29
**Status**: Draft
**Input**: User description: "En el backend necesitamos dejar de depender de nuestra propia base de datos para los artistas seguidos por el usuario, para empezar a depender de los artistas que el usuario sigue en Spotify, para esto necesitamos implementar un API call para recuperar todos los artistas seguidos por el usuario, y cada vez que el usuario mediante el Frontend sigua o deje de seguir a un artista, hará la misma acción en su cuenta de Spotify."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Followed Artists from Spotify (Priority: P1)

As a user, when I open the application, I want to see the list of artists I follow on Spotify so that my TrackWatch experience reflects my actual Spotify preferences without manual synchronization.

**Why this priority**: This is the foundational capability that enables all other features. Without retrieving followed artists from Spotify, the application cannot display accurate data or perform follow/unfollow actions.

**Independent Test**: Can be fully tested by logging in and verifying the displayed artists match the user's Spotify followed artists list.

**Acceptance Scenarios**:

1. **Given** a logged-in user with 10 followed artists on Spotify, **When** the user views their followed artists list, **Then** all 10 artists are displayed with their names and images.

2. **Given** a logged-in user with more than 50 followed artists on Spotify, **When** the user views their followed artists list, **Then** all followed artists are retrieved and displayed (pagination handled automatically).

3. **Given** a logged-in user who recently followed a new artist on Spotify directly, **When** the user refreshes their TrackWatch view, **Then** the newly followed artist appears in the list.

---

### User Story 2 - Follow Artist via TrackWatch (Priority: P2)

As a user, when I follow an artist through the TrackWatch interface, I want that artist to be automatically followed on my Spotify account so that my preferences stay synchronized across both platforms.

**Why this priority**: Enables users to manage their artist follows from TrackWatch while maintaining Spotify as the single source of truth.

**Independent Test**: Can be tested by following an artist in TrackWatch and verifying the follow action is reflected in the user's Spotify account.

**Acceptance Scenarios**:

1. **Given** a logged-in user viewing an artist they don't follow, **When** the user clicks the follow button, **Then** the artist is followed on Spotify AND the UI updates to show the artist as followed.

2. **Given** a logged-in user attempting to follow an artist, **When** the Spotify follow action succeeds, **Then** the user sees a confirmation that the artist was followed.

3. **Given** a logged-in user attempting to follow an artist, **When** the Spotify follow action fails (e.g., network error), **Then** the user sees an error message and the follow state remains unchanged.

---

### User Story 3 - Unfollow Artist via TrackWatch (Priority: P3)

As a user, when I unfollow an artist through the TrackWatch interface, I want that artist to be automatically unfollowed on my Spotify account so that my preferences stay synchronized.

**Why this priority**: Completes the bidirectional sync capability, allowing full artist management from TrackWatch.

**Independent Test**: Can be tested by unfollowing an artist in TrackWatch and verifying the unfollow action is reflected in the user's Spotify account.

**Acceptance Scenarios**:

1. **Given** a logged-in user viewing an artist they currently follow, **When** the user clicks the unfollow button, **Then** the artist is unfollowed on Spotify AND the UI updates to show the artist as not followed.

2. **Given** a logged-in user attempting to unfollow an artist, **When** the Spotify unfollow action succeeds, **Then** the user sees a confirmation that the artist was unfollowed.

3. **Given** a logged-in user attempting to unfollow an artist, **When** the Spotify unfollow action fails, **Then** the user sees an error message and the follow state remains unchanged.

---

### Edge Cases

- What happens when the user's Spotify token expires during a follow/unfollow action? The system should attempt to refresh the token and retry the action.
- What happens when the user has no followed artists on Spotify? The application should display an empty state with guidance.
- What happens when Spotify rate limits are reached? The system should show an appropriate message and retry after the cooldown period.
- What happens when a user tries to follow an artist they already follow? The UI should prevent the action or handle it gracefully.
- What happens when network connectivity is lost during artist list retrieval? The system should show an error state with retry option.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST retrieve all artists the user follows on Spotify when displaying the followed artists list.
- **FR-002**: System MUST handle pagination when retrieving followed artists (Spotify limits results per request).
- **FR-003**: System MUST follow an artist on the user's Spotify account when the user initiates a follow action in TrackWatch.
- **FR-004**: System MUST unfollow an artist on the user's Spotify account when the user initiates an unfollow action in TrackWatch.
- **FR-005**: System MUST update the UI immediately after a successful follow/unfollow action to reflect the new state.
- **FR-006**: System MUST display appropriate error messages when follow/unfollow actions fail.
- **FR-007**: System MUST handle Spotify token refresh transparently during operations.
- **FR-008**: System MUST remove the local `UserFollowedArtist` database table entirely; Spotify is the single source of truth for followed artists.
- **FR-009**: Background jobs for release detection MUST query each user's Spotify followed artists at runtime via API call.

### Key Entities

- **Followed Artist**: An artist that the user follows on Spotify, represented by Spotify artist ID, name, and image URL.
- **User**: The authenticated TrackWatch user with linked Spotify credentials and access tokens.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see their complete Spotify followed artists list within 3 seconds of opening the artists view.
- **SC-002**: Follow/unfollow actions complete and update the UI within 2 seconds under normal network conditions.
- **SC-003**: 100% of follow/unfollow actions initiated in TrackWatch are reflected in the user's Spotify account.
- **SC-004**: Users with up to 500 followed artists can view their complete list without performance degradation.
- **SC-005**: Error messages are displayed within 5 seconds when Spotify operations fail, with clear guidance on resolution.

## Assumptions

- Users will need to re-authenticate with Spotify to grant the new `user-follow-read` and `user-follow-modify` scopes (one-time re-auth acceptable for current user base).
- The existing token refresh mechanism will handle expired tokens appropriately.
- Spotify's Web API for following/unfollowing artists and retrieving followed artists is available and stable.
- The current UI components for displaying artists and follow buttons can be adapted to use Spotify data directly.

## Clarifications

### Session 2026-01-29

- Q: Should the local database table for followed artists (UserFollowedArtist) be removed entirely, or kept as a cache/fallback? → A: Remove entirely - Spotify is the single source of truth.
- Q: How do background jobs for release detection obtain the artist list after table removal? → A: Jobs query each user's Spotify follows at runtime (one API call per user per job run).
- Q: Are user-follow-read and user-follow-modify scopes already requested, or do users need to re-authenticate? → A: New scopes required - users must re-authenticate once (acceptable for current user base).
