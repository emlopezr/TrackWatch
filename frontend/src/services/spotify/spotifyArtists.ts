import { SPOTIFY_API_URL } from '../../common/constants';
import { SpotifyArtistResponse } from "../../types/spotify/SpotifyArtistResponse";
import { TrackifyArtist } from '../../types/trackify/TrackifyArtist';

const artistCache: { [artistId: string]: SpotifyArtistResponse } = {};

export const batchGetArtists = async (
  accessToken: string,
  artists: TrackifyArtist[],
  setArtistsData: (data: SpotifyArtistResponse[]) => void
): Promise<SpotifyArtistResponse[]> => {
  try {
    const allArtistIds = artists.map(artist => artist.id);
    const idsToFetch = allArtistIds.filter(id => !artistCache[id]);

    // Si no hay nuevos artistas, usamos la caché directamente.
    if (idsToFetch.length === 0) {
      const result = allArtistIds.map(id => artistCache[id]);
      setArtistsData(result);
      return result;
    }

    const artistIdsParam = idsToFetch.join(',');

    console.log("[SpotifyAPI] Batch fetching artists");
    const response = await fetch(`${SPOTIFY_API_URL}/artists?ids=${artistIdsParam}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 401) {
      console.error('Invalid access token');
      return [];
    }

    const data = await response.json();

    data.artists.forEach((artist: SpotifyArtistResponse) => {
      artistCache[artist.id] = artist;
    });

    const result = allArtistIds.map(id => artistCache[id]).filter(Boolean);
    setArtistsData(result);
    return result;
  } catch (error) {
    console.error('Error fetching artists:', error);
    return [];
  }
}