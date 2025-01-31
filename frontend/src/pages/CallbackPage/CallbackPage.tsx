import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAccessToken } from '../../services/spotify/spotifyToken';
import { registerTrackifyUser } from '../../services/trackify/trackifyUser';
import { useUser } from '../../context/useUser';

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

        const userData = await registerTrackifyUser(setAccessToken);
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
    <div>
      {loading && (<p>Iniciando sesión...</p>)}
    </div>
  );
};

export default CallbackPage;