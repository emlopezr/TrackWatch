import TrackWatchArtist from "../../types/trackwatch/TrackWatchArtist";
import TrackWatchUser from "../../types/trackwatch/TrackWatchUser";
import { followArtistOnSpotify, unfollowArtistOnSpotify } from "../spotify/spotifyFollowing";

export const followArtist = async (
    userData: TrackWatchUser,
    setUserData: (value: TrackWatchUser) => void,
    artist: TrackWatchArtist
) => {
    try {
        await followArtistOnSpotify(artist.id);

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
    try {
        await unfollowArtistOnSpotify(artistId);

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
