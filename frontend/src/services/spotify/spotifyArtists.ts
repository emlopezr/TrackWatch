import { SPOTIFY_API_URL } from "../../common/constants";
import SpotifyArtistResponse from "../../types/spotify/SpotifyArtistResponse";
import TrackWatchArtist from "../../types/trackwatch/TrackWatchArtist";

const MAX_CONCURRENT_REQUESTS = 5;

const artistCache: { [artistId: string]: SpotifyArtistResponse } = {};

const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
};

const fetchSingleArtist = async (
    accessToken: string,
    artistId: string
): Promise<SpotifyArtistResponse | null> => {
    const response = await fetch(`${SPOTIFY_API_URL}/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.status === 401) {
        console.error("Invalid access token");
        return null;
    }
    if (!response.ok) return null;
    return response.json();
};

const runWithConcurrency = async <T>(
    tasks: (() => Promise<T>)[],
    maxConcurrent: number
): Promise<T[]> => {
    const results: T[] = new Array(tasks.length);
    let index = 0;

    const worker = async () => {
        while (true) {
            const taskIndex = index++;
            if (taskIndex >= tasks.length) break;
            results[taskIndex] = await tasks[taskIndex]();
        }
    };

    await Promise.all(Array.from({ length: maxConcurrent }, () => worker()));
    return results;
};

export const batchGetArtists = async (
    accessToken: string,
    artists: TrackWatchArtist[]
): Promise<SpotifyArtistResponse[]> => {
    try {
        const allArtistIds = artists.map((artist) => artist.id);
        const idsToFetch = allArtistIds.filter((id) => !artistCache[id]);

        if (idsToFetch.length === 0) {
            return allArtistIds.map((id) => artistCache[id]).filter(Boolean);
        }

        const tasks = idsToFetch.map((id) => async () => {
            const artist = await fetchSingleArtist(accessToken, id);
            if (artist) artistCache[artist.id] = artist;
            return artist;
        });

        await runWithConcurrency(tasks, MAX_CONCURRENT_REQUESTS);

        return allArtistIds.map((id) => artistCache[id]).filter(Boolean);
    } catch {
        console.error("Error fetching artists");
        return [];
    }
};
