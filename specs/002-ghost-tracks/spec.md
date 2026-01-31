# Feature Specification: Ghost Tracks Detection and Removal

**Feature Branch**: `002-ghost-tracks`
**Created**: 2026-01-31
**Status**: Draft
**Input**: User description: "Feature to detect and remove unplayable tracks (ghost tracks) from user playlists based on availability in user's country"

## Clarifications

### Session 2026-01-31

- Q: Should users scan only owned playlists or also followed playlists? → A: Only playlists owned by the user (can scan AND remove)
- Q: What should the user see after successful track removal? → A: Show summary modal, then return to playlist selection
- Q: How should the system handle Spotify API rate limits? → A: Automatic retry with exponential backoff (transparent to user)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Detect Ghost Tracks in Playlists (Priority: P1)

A user wants to identify songs in their playlists that are no longer playable in their region. They navigate to a new "Ghost Tracks" tab in the application, select one or more of their playlists, and initiate a scan. The system analyzes all tracks in the selected playlists and returns a list of tracks that cannot be played (either marked as `is_playable = false` or not available in the user's country market).

**Why this priority**: This is the core value proposition - without detection, there is nothing to remove. Users need visibility into which tracks are affected before any action can be taken.

**Independent Test**: Can be fully tested by selecting playlists and receiving a list of ghost tracks. Delivers immediate value by informing users which songs they cannot play.

**Acceptance Scenarios**:

1. **Given** a user has selected one or more playlists, **When** they initiate the ghost track scan, **Then** the system returns a list of all unplayable tracks with their playlist association.
2. **Given** a user has selected playlists containing no ghost tracks, **When** the scan completes, **Then** the system displays a message indicating all tracks are playable.
3. **Given** a user has selected multiple playlists, **When** the scan runs, **Then** all playlists are processed in parallel for faster results.

---

### User Story 2 - Select Ghost Tracks for Removal (Priority: P2)

After receiving the list of ghost tracks, the user can review each track and select which ones they want to remove from their playlists. The interface allows selecting individual tracks or using bulk selection options.

**Why this priority**: Selection is required before removal but depends on detection being complete first. Provides user control over which tracks to remove.

**Independent Test**: Can be tested by displaying a list of ghost tracks and allowing selection. Delivers value by giving users granular control over cleanup decisions.

**Acceptance Scenarios**:

1. **Given** a list of ghost tracks is displayed, **When** the user clicks on a track, **Then** the track is selected for removal (toggled state).
2. **Given** ghost tracks are displayed from multiple playlists, **When** viewing the results, **Then** tracks are grouped by playlist for easy identification.
3. **Given** the user wants to remove all ghost tracks, **When** they use the "select all" option, **Then** all displayed ghost tracks are selected.

---

### User Story 3 - Remove Selected Ghost Tracks (Priority: P3)

The user confirms their selection and initiates the removal process. The system removes the selected tracks from their respective playlists on Spotify.

**Why this priority**: This is the final action that cleans up playlists, but it requires both detection and selection to be complete first.

**Independent Test**: Can be tested by confirming selected tracks and verifying they are removed from Spotify playlists. Delivers the cleanup value users expect.

**Acceptance Scenarios**:

1. **Given** the user has selected tracks for removal, **When** they click the remove button, **Then** the selected tracks are removed from their respective Spotify playlists.
2. **Given** removal is in progress, **When** some tracks fail to be removed, **Then** the user sees which tracks succeeded and which failed.
3. **Given** removal completes successfully, **When** viewing the results, **Then** the user sees a summary modal with the count of tracks removed per playlist.
4. **Given** the user dismisses the summary modal, **When** the modal closes, **Then** the user returns to the playlist selection screen to start a new scan.

---

### Edge Cases

- What happens when a playlist has no ghost tracks? Display a success message indicating all tracks are playable.
- What happens when all tracks in a playlist are ghost tracks? Allow removal but warn the user the playlist will be empty.
- What happens when a playlist is too large (thousands of tracks)? Show progress indication during scan.
- What happens when the user's Spotify token expires mid-operation? Attempt token refresh; if refresh fails, prompt re-authentication.
- What happens when a track removal fails? Report the specific failure and continue with remaining tracks.
- What happens when the same track appears in multiple selected playlists as a ghost track? Show it once per playlist occurrence, allow independent selection.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dedicated navigation tab for the Ghost Tracks feature, similar to the existing Generator tab.
- **FR-002**: System MUST allow users to view and select from their owned Spotify playlists only (excludes followed/collaborative playlists not owned by the user).
- **FR-003**: System MUST accept the user's country code as a parameter (defaulting to "CO" if not provided).
- **FR-004**: System MUST process multiple selected playlists in parallel for efficiency.
- **FR-005**: System MUST identify tracks where `is_playable = false` as ghost tracks.
- **FR-006**: System MUST identify tracks where `available_markets` does not include the user's country as ghost tracks.
- **FR-007**: System MUST return ghost tracks grouped by their source playlist.
- **FR-008**: System MUST display track information including name, artist(s), and album for each ghost track.
- **FR-009**: System MUST allow users to select individual tracks for removal.
- **FR-010**: System MUST allow bulk selection (select all / deselect all) of ghost tracks.
- **FR-011**: System MUST remove selected tracks from their respective Spotify playlists upon user confirmation.
- **FR-012**: System MUST display operation progress during scanning and removal.
- **FR-013**: System MUST report success/failure status for removal operations.
- **FR-014**: System MUST handle Spotify API rate limits transparently using automatic retry with exponential backoff.

### Key Entities

- **Ghost Track**: A track within a playlist that is not playable for the user. Attributes: track ID, track name, artist name(s), album name, album image, playlist ID, playlist name, reason for being unplayable (is_playable false or market unavailable).
- **Playlist**: A user's Spotify playlist. Attributes: playlist ID, playlist name, track count, image URL.
- **Scan Result**: The outcome of analyzing playlists for ghost tracks. Contains the list of ghost tracks found, organized by playlist.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a ghost track scan on up to 10 playlists within 30 seconds for playlists with fewer than 500 tracks each.
- **SC-002**: Users can identify and understand which tracks are unplayable and why within one viewing of the results.
- **SC-003**: Users can remove selected ghost tracks from their playlists in a single action.
- **SC-004**: 95% of removal operations complete successfully when the user has a valid Spotify connection.
- **SC-005**: Users receive clear feedback on operation progress and completion status for both scanning and removal.

## Assumptions

- The user's Spotify access token is valid and includes necessary scopes for reading playlists and modifying playlist tracks.
- The Spotify API provides `is_playable` and/or `available_markets` fields for tracks when queried with appropriate market context.
- The default country code "CO" (Colombia) is appropriate for the primary user base; other countries can be specified via the API.
- Parallel processing of playlists is bounded to avoid rate limiting from the Spotify API.
