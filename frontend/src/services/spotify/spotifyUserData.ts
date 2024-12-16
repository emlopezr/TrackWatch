import { SPOTIFY_API_URL } from '../../common/constants';
import { refreshAccessToken } from './spotifyToken';
import { SpotifyUserResponse } from '../../types/spotify/SpotifyUserResponse';

export const getSpotifyUserData = async (
  accessToken: string,
  setAccessToken: (token: string) => void,
  setUserData: (data: SpotifyUserResponse | null) => void
) => {
  try {
    const response = await fetch(`${SPOTIFY_API_URL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 401) {
      // Si obtenemos un 401 aquí, intentamos renovar el token
      const refreshToken = localStorage.getItem('spotify_refresh_token');
      if (refreshToken) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          localStorage.setItem('spotify_access_token', newToken);
          setAccessToken(newToken);
        }
      }
    } else {
      const data = await response.json();
      setUserData(data);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};
