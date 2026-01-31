import { TRACKWATCH_API_BASE_URL } from "../../common/constants";

export interface GeneratePlaylistResponse {
  message: string;
  playlistId: string;
  artistImageUrl: string;
}

export const generatePlaylist = async (
  accessToken: string,
  userId: string,
  artistId: string
): Promise<GeneratePlaylistResponse> => {
  try {
    const response = await fetch(
      `${TRACKWATCH_API_BASE_URL}/actions/generate?userId=${userId}&artistId=${artistId}`,
      {
        method: 'POST',
        headers: {
          'X-Spotify-Access-Token': accessToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating playlist:', error);
    throw error;
  }
};
