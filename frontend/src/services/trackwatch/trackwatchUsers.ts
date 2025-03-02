import { TRACKWATCH_API_BASE_URL } from '../../common/constants';
import { TrackWatchUser } from '../../types/trackwatch/TrackWatchUser';
import { refreshAccessToken } from '../spotify/spotifyToken';


export const registerTrackWatchUser = async (
  setAccessToken: (token: string) => void,
  setUserData: (data: TrackWatchUser) => void,
  retryNumber: number = 0
) => {
  try {
    console.log('{TrackWatchAPI] Registering user');
    const response = await fetch(`${TRACKWATCH_API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'X-Spotify-Access-Token': localStorage.getItem('spotify_access_token') || '',
        'X-Spotify-Refresh-Token': localStorage.getItem('spotify_refresh_token') || '',
      }
    });

    const data = await response.json();

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
            registerTrackWatchUser(setAccessToken, setUserData, retryNumber + 1);
            return;
          }
        }
      }

      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      throw new Error('Failed to register user');
    }

    if (response.status == 400 && data.code === 'USER_ALREADY_EXISTS') {
      const registeredUser = await getTrackWatchUserData(setAccessToken, setUserData);
      return registeredUser;
    }

    if (response.status !== 201) {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');

      const error = await response.json();
      throw new Error(error.code);
    }

    return data;
  } catch (error) {
    console.error('Error registering user:', error);
  }
}

export const getTrackWatchUserData = async (
  setAccessToken: (token: string) => void,
  setUserData: (data: TrackWatchUser) => void
) => {
  try {
    let url = `${TRACKWATCH_API_BASE_URL}/users/me`;

    const userId = localStorage.getItem('trackwatch_user_id');
    if (userId) {
      // Use query param userId if available
      url = `${url}?userId=${userId}`;
    }

    console.log('[TrackWatchAPI] Fetching user data');
    const response = await fetch(url, {
      headers: {
        'X-Spotify-Access-Token': localStorage.getItem('spotify_access_token') || '',
        'X-Spotify-Refresh-Token': localStorage.getItem('spotify_refresh_token') || '',
      },
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
    localStorage.setItem('trackwatch_user_id', data.id);

    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}