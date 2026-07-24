import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from '../../routing/useRouter';
import { exchangeSpotifyCode } from '../../services/trackwatch/trackwatchUsers';
import { useUser } from '../../context/useUser';
import Spinner from '../../components/Spinner/Spinner';

const CallbackRoute = () => {
  const { setUserData } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (hasRequestedRef.current) return;
      hasRequestedRef.current = true;

      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (!code || !state) {
        navigate('/');
        return;
      }

      try {
        const userData = await exchangeSpotifyCode(code, state);
        if (userData) {
          setUserData(userData);
        }
        navigate('/');

      } catch {
        console.error('Error exchanging Spotify code');
        navigate('/');
      }
    };

    fetchData();
  }, [location, navigate, setUserData]);

  return <Spinner />
};

export default CallbackRoute;
