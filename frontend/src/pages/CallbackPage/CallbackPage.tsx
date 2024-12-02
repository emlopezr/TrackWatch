import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAccessToken } from '../../services/spotifyToken';

const CallbackPage = () => {
  const [, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');

    if (code) {
      const usedCode = localStorage.getItem('spotify_callback_code');
      if (usedCode === code) {
        setLoading(false);
        return;
      }

      localStorage.setItem('spotify_callback_code', code);

      getAccessToken(code)
        .then(token => {
          setAccessToken(token);
          localStorage.removeItem('spotify_callback_code');
          setLoading(false);
          navigate('/');
        })
        .catch(error => {
          console.error('Error obteniendo el token', error);
          setLoading(false);
          navigate('/');
        });
    } else {
      setLoading(false);
      navigate('/');
    }
  }, [location, navigate]);

  return (
    <div>
      {loading && (<p>Iniciando sesión...</p>)}
    </div>
  );
};

export default CallbackPage;