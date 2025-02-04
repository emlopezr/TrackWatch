import { SPOTIFY_API_URL } from '../../common/constants';
import { SpotifyArtistResponse } from "../../types/spotify/SpotifyArtistResponse";
import { TrackifyArtist } from '../../types/trackify/TrackifyArtist';

const artistCache: { [artistId: string]: SpotifyArtistResponse } = {};

const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export const batchGetArtists = async (
  accessToken: string,
  artists: TrackifyArtist[]
): Promise<SpotifyArtistResponse[]> => {
  try {
    const allArtistIds = artists.map(artist => artist.id);
    const idsToFetch = allArtistIds.filter(id => !artistCache[id]);

    if (idsToFetch.length === 0) {
      return allArtistIds.map(id => artistCache[id]).filter(Boolean);
    }

    const batches = chunkArray(idsToFetch, 50);

    for (const batch of batches) {
      const idsParam = batch.join(',');
      console.log("[SpotifyAPI] Batch fetching artists");
      const response = await fetch(`${SPOTIFY_API_URL}/artists?ids=${idsParam}`, {
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
    }

    return allArtistIds.map(id => artistCache[id]).filter(Boolean);
  } catch (error) {
    console.error('Error fetching artists:', error);
    return [];
  }
};