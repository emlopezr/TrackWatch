import { apiFetch } from "../api";
import type {
  PlaylistListResponse,
  ScanResult,
  ScanRequest,
  RemoveResponse,
  RemoveRequest,
} from "../../types/trackwatch/GhostTrack";

export const getOwnedPlaylists = async (): Promise<PlaylistListResponse> => {
  const response = await apiFetch("/ghost-tracks/playlists", {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

export const scanGhostTracks = async (
  request: ScanRequest
): Promise<ScanResult> => {
  const response = await apiFetch("/ghost-tracks/scan", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

export const removeGhostTracks = async (
  request: RemoveRequest
): Promise<RemoveResponse> => {
  const response = await apiFetch("/ghost-tracks/remove", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};
