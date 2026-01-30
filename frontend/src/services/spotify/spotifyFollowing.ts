import { SPOTIFY_API_URL } from "../../common/constants";
import {
    SpotifyFollowedArtistsResponse,
    SpotifyArtist,
} from "../../types/spotify/SpotifyFollowedArtistsResponse";
import TrackWatchArtist from "../../types/trackwatch/TrackWatchArtist";

export const getFollowedArtists = async (
    accessToken: string
): Promise<TrackWatchArtist[]> => {
    const artists: TrackWatchArtist[] = [];
    let after: string | null = null;

    try {
        do {
            const url = new URL(`${SPOTIFY_API_URL}/me/following`);
            url.searchParams.set("type", "artist");
            url.searchParams.set("limit", "50");
            if (after) {
                url.searchParams.set("after", after);
            }

            const response = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.status === 401) {
                throw new Error("Token expired");
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
    accessToken: string,
    artistId: string
): Promise<void> => {
    const url = new URL(`${SPOTIFY_API_URL}/me/following`);
    url.searchParams.set("type", "artist");
    url.searchParams.set("ids", artistId);

    const response = await fetch(url.toString(), {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 401) {
        throw new Error("Token expired");
    }

    if (!response.ok) {
        throw new Error(`Failed to follow artist: ${response.status}`);
    }
};

export const unfollowArtistOnSpotify = async (
    accessToken: string,
    artistId: string
): Promise<void> => {
    const url = new URL(`${SPOTIFY_API_URL}/me/following`);
    url.searchParams.set("type", "artist");
    url.searchParams.set("ids", artistId);

    const response = await fetch(url.toString(), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 401) {
        throw new Error("Token expired");
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
