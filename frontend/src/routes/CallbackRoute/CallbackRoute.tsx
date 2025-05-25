import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAccessToken } from '../../services/spotify/spotifyToken';
import { registerTrackWatchUser } from '../../services/trackwatch/trackwatchUsers';
import { useUser } from '../../context/useUser';
import Spinner from '../../components/Spinner/Spinner';

const CallbackRoute = () => {
  const [, setAccessToken] = useState<string | null>(null);

  const { setUserData } = useUser();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {

      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');

      if (!code) {
        navigate('/');
        return;
      }

      const usedCode = localStorage.getItem('spotify_callback_code');

      if (usedCode === code) {
        return;
      }

      localStorage.setItem('spotify_callback_code', code);

      try {
        const token = await getAccessToken(code);
        setAccessToken(token);
        localStorage.removeItem('spotify_callback_code');

        const userData = await registerTrackWatchUser(setAccessToken, setUserData);
        if (userData) {
          setUserData(userData);
        }
        navigate('/');

      } catch {
        console.error('Error registering user');
        navigate('/');
      }
    };

    fetchData();
  }, [location, navigate, setUserData]);

  return <Spinner />
};

export default CallbackRoute;