import { SPOTIFY_API_URL } from '../../common/constants';
import { SpotifyArtistResponse } from "../../types/spotify/SpotifyArtistResponse";

export const batchGetArtists = async (
  accessToken: string,
  artistIds: string[],
  setArtistsData: (data: SpotifyArtistResponse[]) => void
): Promise<SpotifyArtistResponse[]> => {
  try {
    const artistIdsParam = artistIds.join(',');

    const response = await fetch(`${SPOTIFY_API_URL}/artists?ids=${artistIdsParam}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 401) {
      console.error('Invalid access token');
      return [];
    }

    const data = await response.json();
    setArtistsData(data.artists);
    return data.artists as SpotifyArtistResponse[];

  } catch (error) {
    console.error('Error fetching artists:', error);
    return [];
  }
}