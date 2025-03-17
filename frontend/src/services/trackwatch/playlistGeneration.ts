import { TRACKWATCH_API_BASE_URL } from "../../common/constants";

/**
 * Generates a playlist based on the selected artist
 * @param accessToken Spotify access token
 * @param userId User ID from TrackWatch
 * @param artistId Artist ID from Spotify
 * @returns Promise with the API response
 */
export const generatePlaylist = async (
  accessToken: string,
  userId: string,
  artistId: string
): Promise<any> => {
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

    return await response.text();
  } catch (error) {
    console.error('Error generating playlist:', error);
    throw error;
  }
};
