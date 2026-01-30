# Tasks: Spotify Artists Sync

**Input**: Design documents from `/specs/001-spotify-artists-sync/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested - manual testing only per plan.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/`, `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: OAuth scope configuration and TypeScript types

- [x] T001 Update OAuth scopes to include `user-follow-read` and `user-follow-modify` in frontend/src/common/constants.ts
- [x] T002 [P] Create SpotifyFollowedArtistsResponse type in frontend/src/types/spotify/SpotifyFollowedArtistsResponse.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend Spotify client for follow operations - required by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create get_followed_artists function with pagination in backend/app/clients/spotify/spotify_follow_api_client.py
- [x] T004 [P] Create follow_artist function in backend/app/clients/spotify/spotify_follow_api_client.py
- [x] T005 [P] Create unfollow_artist function in backend/app/clients/spotify/spotify_follow_api_client.py
- [x] T006 Export new client functions in backend/app/clients/spotify/__init__.py

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Followed Artists from Spotify (Priority: P1) 🎯 MVP

**Goal**: Display user's followed artists from Spotify instead of local database

**Independent Test**: Log in and verify displayed artists match Spotify followed artists list

### Implementation for User Story 1

- [x] T007 [P] [US1] Create getFollowedArtists service with pagination in frontend/src/services/spotify/spotifyFollowing.ts
- [x] T008 [P] [US1] Create get_user_followed_artists function using Spotify client in backend/app/services/artist_service.py
- [x] T009 [US1] Update search_followed_releases_use_case.py to use Spotify API instead of user.followed_artists.all() in backend/app/services/search_followed_releases_use_case.py
- [x] T010 [US1] Update frontend to call getFollowedArtists from Spotify service in frontend/src/services/trackwatch/trackwatchArtists.ts or relevant component
- [x] T011 [US1] Add error handling for empty artist list and network failures in frontend components

**Checkpoint**: User Story 1 complete - users can view their Spotify followed artists

---

## Phase 4: User Story 2 - Follow Artist via TrackWatch (Priority: P2)

**Goal**: Follow action in TrackWatch follows artist on Spotify

**Independent Test**: Follow an artist in TrackWatch and verify it appears in Spotify app

### Implementation for User Story 2

- [x] T012 [P] [US2] Create followArtistOnSpotify service function in frontend/src/services/spotify/spotifyFollowing.ts
- [x] T013 [US2] Update followArtist function to call Spotify API instead of backend in frontend/src/services/trackwatch/trackwatchArtists.ts
- [x] T014 [US2] Update backend follow_artist in backend/app/services/artist_service.py to call Spotify API (for consistency)
- [x] T015 [US2] Add success/error feedback for follow action in frontend UI components

**Checkpoint**: User Stories 1 AND 2 complete - users can view and follow artists

---

## Phase 5: User Story 3 - Unfollow Artist via TrackWatch (Priority: P3)

**Goal**: Unfollow action in TrackWatch unfollows artist on Spotify

**Independent Test**: Unfollow an artist in TrackWatch and verify it's removed from Spotify app

### Implementation for User Story 3

- [x] T016 [P] [US3] Create unfollowArtistOnSpotify service function in frontend/src/services/spotify/spotifyFollowing.ts
- [x] T017 [US3] Update unfollowArtist function to call Spotify API instead of backend in frontend/src/services/trackwatch/trackwatchArtists.ts
- [x] T018 [US3] Update backend unfollow_artist in backend/app/services/artist_service.py to call Spotify API (for consistency)
- [x] T019 [US3] Add success/error feedback for unfollow action in frontend UI components

**Checkpoint**: All user stories complete - full Spotify artist sync functionality

---

## Phase 6: Cleanup (Database Migration)

**Purpose**: Remove deprecated local database table and model

- [x] T020 Remove UserFollowedArtist import from backend/app/models/__init__.py
- [x] T021 Delete UserFollowedArtist model file backend/app/models/user_followed_artist.py
- [x] T022 Run `python manage.py makemigrations` to generate migration for table removal
- [ ] T023 Run `python manage.py migrate` to apply migration and drop table
- [x] T024 Remove any remaining references to UserFollowedArtist in backend codebase

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [ ] T025 Run quickstart.md validation steps (view artists, follow, unfollow)
- [ ] T026 Verify background job works correctly with Spotify API (trigger manually)
- [x] T027 Update CLAUDE.md to remove UserFollowedArtist from Database Models section

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on T002 type definitions
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 2; can run parallel to US1
- **User Story 3 (Phase 5)**: Depends on Phase 2; can run parallel to US1/US2
- **Cleanup (Phase 6)**: Depends on ALL user stories being complete and verified
- **Polish (Phase 7)**: Depends on Cleanup completion

### User Story Dependencies

- **User Story 1 (P1)**: Independent after Foundational phase
- **User Story 2 (P2)**: Independent after Foundational phase (can parallel with US1)
- **User Story 3 (P3)**: Independent after Foundational phase (can parallel with US1/US2)

### Within Each User Story

- Frontend service before UI integration
- Backend service updates can parallel frontend work
- Error handling after core functionality

### Parallel Opportunities

- T001 and T002 can run in parallel (Setup phase)
- T004 and T005 can run in parallel (Foundational phase)
- T007 and T008 can run in parallel (US1 - different stacks)
- T012 can parallel with US1 tasks (US2 frontend service)
- T016 can parallel with US1/US2 tasks (US3 frontend service)
- All user stories can run in parallel after Foundational phase

---

## Parallel Example: User Story 1

```bash
# Launch frontend and backend tasks together:
Task: "Create getFollowedArtists service with pagination in frontend/src/services/spotify/spotifyFollowing.ts"
Task: "Create get_user_followed_artists function using Spotify client in backend/app/services/artist_service.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (OAuth scopes, types)
2. Complete Phase 2: Foundational (Spotify client functions)
3. Complete Phase 3: User Story 1 (view followed artists)
4. **STOP and VALIDATE**: Verify artists display correctly from Spotify
5. Can deploy/demo MVP at this point

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test viewing artists → MVP deployed!
3. Add User Story 2 → Test following artists
4. Add User Story 3 → Test unfollowing artists
5. Complete Cleanup → Remove old database table
6. Polish → Final validation

### Recommended Execution Order (Single Developer)

1. T001 → T002 (Setup)
2. T003 → T004, T005 → T006 (Foundational)
3. T007, T008 → T009 → T010 → T011 (US1 - MVP)
4. **VALIDATE MVP**
5. T012 → T013 → T014 → T015 (US2)
6. T016 → T017 → T018 → T019 (US3)
7. T020 → T021 → T022 → T023 → T024 (Cleanup)
8. T025 → T026 → T027 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story can be independently tested after completion
- Cleanup phase MUST wait until all functionality is verified working
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
