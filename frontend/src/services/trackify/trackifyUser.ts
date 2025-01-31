import { TRACKIFY_API_BASE_URL } from '../../common/constants';
import { TrackifyUser } from '../../types/trackify/TrackifyUser';
import { refreshAccessToken } from '../spotify/spotifyToken';


export const registerTrackifyUser = async (
  setAccessToken: (token: string) => void,
  retryNumber: number = 0
) => {
  try {
    const response = await fetch(`${TRACKIFY_API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'X-Spotify-Access-Token': localStorage.getItem('spotify_access_token') || '',
        'X-Spotify-Refresh-Token': localStorage.getItem('spotify_refresh_token') || '',
      }
    });

    if (response.status === 401) {
      // Si obtenemos un 401 aquí, intentamos renovar el token
      const refreshToken = localStorage.getItem('spotify_refresh_token');

      if (refreshToken) {
        const newToken = await refreshAccessToken();

        if (newToken) {
          localStorage.setItem('spotify_access_token', newToken);
          setAccessToken(newToken);

          // Retry the request
          if (retryNumber < 1) {
            registerTrackifyUser(setAccessToken, retryNumber + 1);
            return;
          }
        }
      }

      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      throw new Error('Failed to register user');
    }

    if (response.status !== 201) {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');

      console.error('Failed to register user:', response.json());
      throw new Error('Failed to register user');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error registering user:', error);
  }
}

export const getTrackifyUserData = async (
  setAccessToken: (token: string) => void,
  setUserData: (data: TrackifyUser) => void
) => {
  try {
    const response = await fetch(`${TRACKIFY_API_BASE_URL}/users/me`, {
      headers: {
        'X-Spotify-Access-Token': localStorage.getItem('spotify_access_token') || '',
        'X-Spotify-Refresh-Token': localStorage.getItem('spotify_refresh_token') || '',
      }
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

      throw new Error('Failed to fetch user data');
    }

    if (response.status !== 200) {
      console.error('Failed to fetch user data:', response.json());
      throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    setUserData(data);

  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}