import { apiFetch } from "../api";
import TrackWatchUser from "../../types/trackwatch/TrackWatchUser";
import { mapTrackWatchUser } from "../../utils/apiMapper";

export const exchangeSpotifyCode = async (
    code: string,
    state: string
): Promise<TrackWatchUser | null> => {
    try {
        const response = await apiFetch("/auth/spotify/exchange", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.error_description ||
                error.code ||
                "Failed to exchange Spotify code"
            );
        }

        const data = await response.json();
        return mapTrackWatchUser(data);
    } catch {
        console.error("Error exchanging Spotify code");
        return null;
    }
};

export const getTrackWatchUserData = async (): Promise<TrackWatchUser | undefined> => {
    try {
        const response = await apiFetch("/users/me");
        if (response.status === 401) {
            return undefined;
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const data = await response.json();
        return mapTrackWatchUser(data);
    } catch {
        return undefined;
    }
};

export const togglePlaylistUpdates = async (
    userId: string,
    updatesEnabled: boolean
) => {
    try {
        const response = await apiFetch(`/users/${userId}/playlist-updates`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ updatesEnabled }),
        });

        if (response.status !== 200) {
            throw new Error(`Failed to update setting: ${response.status}`);
        }

        const data = await response.json();
        return data.updatesEnabled as boolean;
    } catch (error) {
        console.error("Error toggling playlist updates", error);
        throw error;
    }
};

export const logoutTrackWatchUser = async (): Promise<void> => {
    const response = await apiFetch("/auth/logout", { method: "POST" });
    if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to logout: ${response.status}`);
    }
};
