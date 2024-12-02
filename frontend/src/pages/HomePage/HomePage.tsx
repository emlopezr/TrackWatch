import { useEffect, useState } from 'react';
import { getSpotifyAuthUrl } from '../../services/spotifyAuth'
import { SPOTIFY_API_URL } from '../../common/constants';
import spotifyLogo from '../../assets/spotify.svg'
import './HomePage.css'
import { SpotifyUserResponse } from '../../types/SpotifyUserResponse';

const HomePage = () => {
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<SpotifyUserResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      setAccessToken(token);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (accessToken) {
      const fetchUserData = async () => {
        const response = await fetch(`${SPOTIFY_API_URL}/me`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const data = await response.json();
        setUserData(data);
        console.log('User data', data);
      }

      fetchUserData();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className='login'>
        <h1 className='login__title' >Trackify</h1>
        <a href={getSpotifyAuthUrl()} className='login__link'>
          <button className='login__button'>
            <img src={spotifyLogo} alt='Spotify Logo' className='login__logo' />
            Iniciar sesión con Spotify
          </button>
        </a>
      </div>
    )
  }

  return (
    <div className='user'>
      {userData ? (
        <div className='profile'>
          <h1>Bienvenido a Trackify, {userData.display_name}!</h1>
          <a href={userData.external_urls.spotify}>
            <img src={userData.images[0]?.url} alt='Imagen de perfil' width={100} className='profile__image' />
          </a>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}

export default HomePage