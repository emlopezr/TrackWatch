# Tasks: Ghost Tracks Detection and Removal

**Input**: Design documents from `/specs/002-ghost-tracks/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested - manual testing only per Technical Context

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: TypeScript types and frontend service foundation

- [x] T001 [P] Create TypeScript interfaces for Playlist, GhostTrack, ScanResult, RemovalResult in `frontend/src/types/trackwatch/GhostTrack.ts`
- [x] T002 [P] Create ghost tracks API service file with base structure in `frontend/src/services/trackwatch/ghostTracks.ts`
- [x] T003 [P] Add Ghost Tracks route to React Router in `frontend/src/routes/MainRoute/MainRoute.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend Spotify client extensions and core service that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Add `get_user_playlists` function with pagination to `backend/app/clients/spotify/spotify_playlist_api_client.py`
- [x] T005 Add `get_playlist_tracks_with_market` function (returns is_playable field) to `backend/app/clients/spotify/spotify_playlist_api_client.py`
- [x] T006 Add `remove_tracks_from_playlist` function to `backend/app/clients/spotify/spotify_playlist_api_client.py`
- [x] T007 Implement retry logic with exponential backoff for 429 responses in `backend/app/clients/spotify/spotify_api_client.py`
- [x] T008 Create ghost tracks service file with helper functions in `backend/app/services/ghost_tracks_service.py`
- [x] T009 Create ghost tracks view file and register URL routes in `backend/app/views/ghost_tracks_view.py` and `backend/app/urls.py`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Detect Ghost Tracks in Playlists (Priority: P1) 🎯 MVP

**Goal**: Users can select playlists and scan for unplayable tracks, receiving a grouped list of ghost tracks

**Independent Test**: Navigate to Ghost Tracks tab, select playlists, click Scan, verify ghost tracks are displayed grouped by playlist

### Backend Implementation for User Story 1

- [x] T010 [US1] Implement `get_owned_playlists` function that filters by owner.id in `backend/app/services/ghost_tracks_service.py`
- [x] T011 [US1] Implement `scan_playlist_for_ghost_tracks` function that detects is_playable=false tracks in `backend/app/services/ghost_tracks_service.py`
- [x] T012 [US1] Implement `scan_playlists_parallel` function using ThreadPoolExecutor (max 3 workers) in `backend/app/services/ghost_tracks_service.py`
- [x] T013 [US1] Implement GET `/ghost-tracks/playlists` endpoint in `backend/app/views/ghost_tracks_view.py`
- [x] T014 [US1] Implement POST `/ghost-tracks/scan` endpoint in `backend/app/views/ghost_tracks_view.py`

### Frontend Implementation for User Story 1

- [x] T015 [P] [US1] Implement `getOwnedPlaylists` API call in `frontend/src/services/trackwatch/ghostTracks.ts`
- [x] T016 [P] [US1] Implement `scanGhostTracks` API call in `frontend/src/services/trackwatch/ghostTracks.ts`
- [x] T017 [P] [US1] Create PlaylistSelector component directory and files in `frontend/src/components/PlaylistSelector/PlaylistSelector.tsx` and `PlaylistSelector.css`
- [x] T018 [US1] Implement PlaylistSelector with multi-select checkboxes and playlist images in `frontend/src/components/PlaylistSelector/PlaylistSelector.tsx`
- [x] T019 [P] [US1] Create GhostTrackList component directory and files in `frontend/src/components/GhostTrackList/GhostTrackList.tsx` and `GhostTrackList.css`
- [x] T020 [US1] Implement GhostTrackList displaying tracks grouped by playlist (read-only view) in `frontend/src/components/GhostTrackList/GhostTrackList.tsx`
- [x] T021 [P] [US1] Create GhostTracksPage directory and files in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx` and `GhostTracksPage.css`
- [x] T022 [US1] Implement GhostTracksPage with playlist loading, selection, scan button, and results display in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx`
- [x] T023 [US1] Add loading spinner and progress indication during scan in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx`
- [x] T024 [US1] Add "No ghost tracks found" success message when scan returns empty results in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx`

**Checkpoint**: User Story 1 complete - users can scan playlists and see ghost tracks

---

## Phase 4: User Story 2 - Select Ghost Tracks for Removal (Priority: P2)

**Goal**: Users can select individual or all ghost tracks for removal using checkboxes

**Independent Test**: After scanning, click on tracks to toggle selection, use Select All/Deselect All buttons, verify selection state persists

### Frontend Implementation for User Story 2

- [x] T025 [US2] Add selection state management (selectedTrackKeys Set) to GhostTracksPage in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx`
- [x] T026 [US2] Add checkbox and onClick selection toggle to GhostTrackList items in `frontend/src/components/GhostTrackList/GhostTrackList.tsx`
- [x] T027 [US2] Add Select All / Deselect All buttons per playlist in `frontend/src/components/GhostTrackList/GhostTrackList.tsx`
- [x] T028 [US2] Add global Select All / Deselect All buttons in GhostTracksPage in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx`
- [x] T029 [US2] Style selected tracks with visual highlight in `frontend/src/components/GhostTrackList/GhostTrackList.css`
- [x] T030 [US2] Add selection count display showing "X of Y selected" in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx`

**Checkpoint**: User Story 2 complete - users can select tracks for removal

---

## Phase 5: User Story 3 - Remove Selected Ghost Tracks (Priority: P3)

**Goal**: Users can remove selected tracks from playlists and see a summary modal with results

**Independent Test**: Select tracks, click Remove, verify tracks are removed from Spotify, see summary modal, dismiss to return to playlist selection

### Backend Implementation for User Story 3

- [x] T031 [US3] Implement `remove_tracks_from_playlists` function handling batches of 100 tracks in `backend/app/services/ghost_tracks_service.py`
- [x] T032 [US3] Implement POST `/ghost-tracks/remove` endpoint in `backend/app/views/ghost_tracks_view.py`

### Frontend Implementation for User Story 3

- [x] T033 [P] [US3] Implement `removeGhostTracks` API call in `frontend/src/services/trackwatch/ghostTracks.ts`
- [x] T034 [US3] Add "Remove Selected" button (disabled when no selection) to GhostTracksPage in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx`
- [x] T035 [US3] Add loading state and progress indication during removal in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx`
- [x] T036 [US3] Implement summary modal showing removed/failed counts per playlist in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx`
- [x] T037 [US3] Implement return to playlist selection on modal dismiss in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx`
- [x] T038 [US3] Handle partial failure - display which tracks succeeded and which failed in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx`

**Checkpoint**: User Story 3 complete - full feature is functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, and UX improvements

- [x] T039 [P] Add error handling for Spotify token expiration with refresh attempt in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx`
- [x] T040 [P] Add warning when all tracks in a playlist are selected for removal in `frontend/src/pages/GhostTracksPage/GhostTracksPage.tsx`
- [x] T041 [P] Add navigation link to Ghost Tracks tab in main navigation in `frontend/src/layout/Sidebar/Sidebar.tsx`
- [x] T042 Validate country code parameter (ISO 3166-1 alpha-2 format) in backend scan endpoint in `backend/app/views/ghost_tracks_view.py`
- [ ] T043 Run manual testing per quickstart.md checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 (needs ghost track display to add selection)
- **User Story 3 (Phase 5)**: Depends on User Story 2 (needs selection to enable removal)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Core functionality - no dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 - needs ghost track list to add selection UI
- **User Story 3 (P3)**: Depends on US2 - needs selection state to enable removal

### Within Each Phase

- Backend tasks should complete before frontend integration
- Component creation [P] tasks can run in parallel
- Page implementation depends on components being ready

### Parallel Opportunities

**Phase 1** (all tasks can run in parallel):
- T001, T002, T003

**Phase 2** (sequential due to dependencies):
- T004-T006 can run in parallel (Spotify client functions)
- T007 must complete before T008-T009

**Phase 3 - User Story 1**:
- Backend: T010-T014 sequential (service functions before endpoints)
- Frontend: T015-T016 parallel (API calls), T017+T019+T021 parallel (component creation)

**Phase 4 - User Story 2**:
- T025-T030 mostly sequential (state management first, then UI)

**Phase 5 - User Story 3**:
- Backend T031-T032 sequential
- Frontend T033 can start early, T034-T038 sequential

**Phase 6**:
- T039, T040, T041 can run in parallel

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# Launch backend API calls in parallel:
Task: "Implement getOwnedPlaylists API call" (T015)
Task: "Implement scanGhostTracks API call" (T016)

# Launch component file creation in parallel:
Task: "Create PlaylistSelector component directory" (T017)
Task: "Create GhostTrackList component directory" (T019)
Task: "Create GhostTracksPage directory" (T021)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T009)
3. Complete Phase 3: User Story 1 (T010-T024)
4. **STOP and VALIDATE**: Can scan playlists and see ghost tracks
5. Deploy/demo if ready - users get visibility into unplayable tracks

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Users can detect ghost tracks (MVP!)
3. Add User Story 2 → Users can select which tracks to remove
4. Add User Story 3 → Users can remove tracks (Full feature!)
5. Add Polish → Production-ready with edge case handling

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- User Story 2 and 3 have UI dependencies on previous stories
- No database migrations needed - all data is transient from Spotify API
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
