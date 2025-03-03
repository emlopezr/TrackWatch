import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAccessToken } from '../../services/spotify/spotifyToken';
import { registerTrackWatchUser } from '../../services/trackwatch/trackwatchUsers';
import { useUser } from '../../context/useUser';
import Spinner from '../../components/Spinner/Spinner';

const CallbackPage = () => {
  const [ , setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { setUserData } = useUser();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {

      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');

      if (!code) {
        setLoading(false);
        navigate('/');
        return;
      }

      const usedCode = localStorage.getItem('spotify_callback_code');

      if (usedCode === code) {
        setLoading(false);
        return;
      }

      localStorage.setItem('spotify_callback_code', code);

      try {
        const token = await getAccessToken(code);
        setAccessToken(token);
        localStorage.removeItem('spotify_callback_code');

        const userData = await registerTrackWatchUser(setAccessToken, setUserData);
        setUserData(userData);
        navigate('/');

      } catch (error) {
        console.error('Error registering user:', error);
        setLoading(false);
        navigate('/');
      }
    };

    fetchData();
  }, [location, navigate, setUserData]);

  return (
    <div> {loading && <Spinner />} </div>
  );
};

export default CallbackPage;