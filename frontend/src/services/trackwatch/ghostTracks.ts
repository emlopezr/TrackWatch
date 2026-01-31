import { TRACKWATCH_API_BASE_URL } from "../../common/constants";
import type {
  PlaylistListResponse,
  ScanResult,
  ScanRequest,
  RemoveResponse,
  RemoveRequest,
} from "../../types/trackwatch/GhostTrack";

export const getOwnedPlaylists = async (
  accessToken: string
): Promise<PlaylistListResponse> => {
  const response = await fetch(
    `${TRACKWATCH_API_BASE_URL}/ghost-tracks/playlists`,
    {
      method: 'GET',
      headers: {
        'X-Spotify-Access-Token': accessToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

export const scanGhostTracks = async (
  accessToken: string,
  request: ScanRequest
): Promise<ScanResult> => {
  const response = await fetch(
    `${TRACKWATCH_API_BASE_URL}/ghost-tracks/scan`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Spotify-Access-Token': accessToken,
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

export const removeGhostTracks = async (
  accessToken: string,
  request: RemoveRequest
): Promise<RemoveResponse> => {
  const response = await fetch(
    `${TRACKWATCH_API_BASE_URL}/ghost-tracks/remove`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Spotify-Access-Token': accessToken,
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};