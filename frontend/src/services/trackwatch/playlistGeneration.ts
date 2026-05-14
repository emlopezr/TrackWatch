import { apiFetch } from "../api";

export interface GeneratePlaylistResponse {
  message: string;
  playlistId: string;
  artistImageUrl: string;
}

export const generatePlaylist = async (
  artistId: string
): Promise<GeneratePlaylistResponse> => {
  try {
    const response = await apiFetch(`/actions/generate?artistId=${artistId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating playlist:', error);
    throw error;
  }
};
