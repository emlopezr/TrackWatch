import { apiFetch } from "../api";
import {
    SpotifyFollowedArtistsResponse,
    SpotifyArtist,
} from "../../types/spotify/SpotifyFollowedArtistsResponse";
import TrackWatchArtist from "../../types/trackwatch/TrackWatchArtist";

export const getFollowedArtists = async (
): Promise<TrackWatchArtist[]> => {
    const artists: TrackWatchArtist[] = [];
    let after: string | null = null;

    try {
        do {
            const params = new URLSearchParams({
                type: "artist",
                limit: "50",
            });
            if (after) {
                params.set("after", after);
            }

            const response = await apiFetch(`/spotify/me/following?${params.toString()}`);

            if (response.status === 401) {
                throw new Error("Session expired");
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch followed artists: ${response.status}`);
            }

            const data: SpotifyFollowedArtistsResponse = await response.json();

            for (const item of data.artists.items) {
                artists.push(mapSpotifyArtistToTrackWatch(item));
            }

            after = data.artists.cursors?.after ?? null;
        } while (after);

        return artists;
    } catch (error) {
        console.error("Error fetching followed artists:", error);
        throw error;
    }
};

export const followArtistOnSpotify = async (
    artistId: string
): Promise<void> => {
    const params = new URLSearchParams({
        type: "artist",
        ids: artistId,
    });

    const response = await apiFetch(`/spotify/me/following?${params.toString()}`, {
        method: "PUT",
    });

    if (response.status === 401) {
        throw new Error("Session expired");
    }

    if (!response.ok) {
        throw new Error(`Failed to follow artist: ${response.status}`);
    }
};

export const unfollowArtistOnSpotify = async (
    artistId: string
): Promise<void> => {
    const params = new URLSearchParams({
        type: "artist",
        ids: artistId,
    });

    const response = await apiFetch(`/spotify/me/following?${params.toString()}`, {
        method: "DELETE",
    });

    if (response.status === 401) {
        throw new Error("Session expired");
    }

    if (!response.ok) {
        throw new Error(`Failed to unfollow artist: ${response.status}`);
    }
};

const mapSpotifyArtistToTrackWatch = (artist: SpotifyArtist): TrackWatchArtist => {
    return {
        id: artist.id,
        name: artist.name,
    };
};
