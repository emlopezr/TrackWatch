import { useState, useEffect } from 'react';
import { refreshAccessToken, verifyToken } from '../services/spotify/spotifyToken';
import { getTrackWatchUserData } from '../services/trackwatch/trackwatchUsers';
import { useUser } from '../context/useUser';

interface TokenManagerResult {
  loading: boolean;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

export const useTokenManager = (): TokenManagerResult => {
  const { userData, setUserData } = useUser()
  
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const checkAndRefreshToken = async () => {
    const token = localStorage.getItem('spotify_access_token');
    const refreshToken = localStorage.getItem('spotify_refresh_token');

    if (token) {
      const isValid = await verifyToken(token);

      if (isValid) {
        setAccessToken(token);
      } else if (refreshToken) {
        // If the token is not valid, try to renew it.
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            localStorage.setItem('spotify_access_token', newToken);
            setAccessToken(newToken);
          }
        } catch {
          console.error('Error refreshing token');
        }
      }
    } else if (refreshToken) {
      // No access token, but there is refresh token: renew directly
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          localStorage.setItem('spotify_access_token', newToken);
          setAccessToken(newToken);
        }
      } catch {
        console.error('Error refreshing token');
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    checkAndRefreshToken();
  }, []);

  useEffect(() => {
    if (accessToken && !userData) {
      getTrackWatchUserData(setAccessToken, setUserData);
    }
  }, [accessToken, setUserData, userData]);

  return { loading, accessToken, setAccessToken };
};