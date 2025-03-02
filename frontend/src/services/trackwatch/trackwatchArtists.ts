import { TrackWatchArtist } from "../../types/trackwatch/TrackWatchArtist";
import { TRACKWATCH_API_BASE_URL } from "../../common/constants";
import { TrackWatchUser } from "../../types/trackwatch/TrackWatchUser";

export const followArtist = async (userData: TrackWatchUser, setUserData: (value: TrackWatchUser) => void, artist: TrackWatchArtist) => {
  try {
    console.log("[TrackWatchAPI] Following artist", artist.id);
    const response = await fetch(
      `${TRACKWATCH_API_BASE_URL}/artists/follow?userId=${userData.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Spotify-Access-Token": localStorage.getItem("spotify_access_token") || "",
        },
        body: JSON.stringify({
          id: artist.id,
          name: artist.name,
        }),
      }
    );

    if (!response.ok) throw new Error("Error al seguir al artista");

    setUserData({
      ...userData,
      followedArtists: [...userData.followedArtists, artist],
    });

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const unfollowArtist = async (artistId: string, userData: TrackWatchUser, setUserData: (value: TrackWatchUser) => void) => {
  try {
    console.log("[TrackWatchAPI] Unfollowing artist", artistId);
    const response = await fetch(
      `${TRACKWATCH_API_BASE_URL}/artists/unfollow?userId=${userData.id}&artistId=${artistId}`,
      {
        method: "POST",
        headers: {
          "X-Spotify-Access-Token": localStorage.getItem("spotify_access_token") || "",
        },
      }
    );

    if (!response.ok) throw new Error("Error al dejar de seguir al artista");

    setUserData({
      ...userData,
      followedArtists: userData.followedArtists.filter( (artist) => artist.id !== artistId ),
    });

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
