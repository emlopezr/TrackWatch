import { SPOTIFY_API_URL } from '../../common/constants';
import { SpotifyArtistResponse } from "../../types/spotify/SpotifyArtistResponse";

export const searchArtists = async (
  accessToken: string,
  searchQuery: string,
  setArtistsData: (data: SpotifyArtistResponse[]) => void
): Promise<SpotifyArtistResponse[]> => {
  try {
    if (!searchQuery || searchQuery.length === 0) {
      setArtistsData([]);
      return [];
    }

    const params = new URLSearchParams({
      q: searchQuery,
      type: 'artist',
      limit: '50',
    });

    console.log("[SpotifyAPI] Searching artists");
    const response = await fetch(`${SPOTIFY_API_URL}/search?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 401) {
      console.error('Invalid access token');
      return [];
    }

    const data = await response.json();
    setArtistsData(data.artists.items);
    return data.artists.items as SpotifyArtistResponse[];

  } catch (error) {
    console.error('Error fetching artists:', error);
    return [];
  }
}