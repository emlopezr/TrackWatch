import { TrackifyArtist } from "../../types/trackify/TrackifyArtist";
import { TRACKIFY_API_BASE_URL } from "../../common/constants";
import { TrackifyUser } from "../../types/trackify/TrackifyUser";

export const followArtist = async (userData: TrackifyUser, setUserData: (value: TrackifyUser) => void, artist: TrackifyArtist) => {
  try {
    const response = await fetch(
      `${TRACKIFY_API_BASE_URL}/artists/follow?userId=${userData.id}`,
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

export const unfollowArtist = async (artistId: string, userData: TrackifyUser, setUserData: (value: TrackifyUser) => void) => {
  try {
    const response = await fetch(
      `${TRACKIFY_API_BASE_URL}/artists/unfollow?userId=${userData.id}&artistId=${artistId}`,
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
