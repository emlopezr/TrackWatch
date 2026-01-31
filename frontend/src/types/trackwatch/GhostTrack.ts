export interface Playlist {
  id: string;
  name: string;
  imageUrl: string | null;
  trackCount: number;
}

export interface GhostTrack {
  trackId: string;
  trackUri: string;
  trackName: string;
  artistNames: string[];
  albumName: string;
  albumImageUrl: string | null;
  playlistId: string;
  playlistName: string;
  reason: 'market' | 'not_playable';
}

export interface PlaylistScanResult {
  playlistId: string;
  playlistName: string;
  ghostTracks: GhostTrack[];
  totalTracks: number;
  scannedTracks: number;
  error: string | null;
}

export interface ScanResult {
  playlists: PlaylistScanResult[];
  totalGhostTracks: number;
  scanDurationMs: number;
}

export interface RemovalResult {
  playlistId: string;
  playlistName: string;
  removedCount: number;
  failedCount: number;
  failedTracks: string[];
}

export interface RemoveResponse {
  results: RemovalResult[];
  totalRemoved: number;
  totalFailed: number;
}

export interface PlaylistListResponse {
  playlists: Playlist[];
}

export interface ScanRequest {
  playlistIds: string[];
  countryCode?: string;
}

export interface RemoveRequest {
  removals: {
    playlistId: string;
    trackUris: string[];
  }[];
}