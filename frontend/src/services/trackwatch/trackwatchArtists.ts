import TrackWatchArtist from "../../types/trackwatch/TrackWatchArtist";
import TrackWatchUser from "../../types/trackwatch/TrackWatchUser";
import { followArtistOnSpotify, unfollowArtistOnSpotify } from "../spotify/spotifyFollowing";

export const followArtist = async (
    userData: TrackWatchUser,
    setUserData: (value: TrackWatchUser) => void,
    artist: TrackWatchArtist
) => {
    const accessToken = localStorage.getItem("spotify_access_token") || "";

    try {
        await followArtistOnSpotify(accessToken, artist.id);

        setUserData({
            ...userData,
            followedArtists: [...userData.followedArtists, artist],
        });

        return true;
    } catch (error) {
        console.error("Error following artist:", error);
        return false;
    }
};

export const unfollowArtist = async (
    artistId: string,
    userData: TrackWatchUser,
    setUserData: (value: TrackWatchUser) => void
) => {
    const accessToken = localStorage.getItem("spotify_access_token") || "";

    try {
        await unfollowArtistOnSpotify(accessToken, artistId);

        setUserData({
            ...userData,
            followedArtists: userData.followedArtists.filter(
                (artist) => artist.id !== artistId
            ),
        });

        return true;
    } catch (error) {
        console.error("Error unfollowing artist:", error);
        return false;
    }
};
