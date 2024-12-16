import { useEffect, useState } from 'react';
import { getSpotifyAuthUrl } from '../../services/spotify/spotifyAuth';
import { refreshAccessToken, verifyToken } from '../../services/spotify/spotifyToken';
import { getSpotifyUserData } from '../../services/spotify/spotifyUserData';
import { getFollowedArtists } from '../../services/trackify/trackifyArtists';
import SearchArtists from '../../components/SearchArtists/SearchArtists';
import FollowedArtists from '../../components/FollowedArtists/FollowedArtists';
import { SpotifyUserResponse } from '../../types/spotify/SpotifyUserResponse';
import spotifyLogo from '../../assets/svg/spotify.svg';
import './HomePage.css';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<SpotifyUserResponse | null>(null);
  const [followedArtists, setFollowedArtists] = useState<string[]>([]);
  const [searching, setSearching] = useState(false)

  // Función para verificar y renovar el token si es necesario
  const checkAndRefreshToken = async () => {
    const token = localStorage.getItem('spotify_access_token');
    const refreshToken = localStorage.getItem('spotify_refresh_token');

    if (token) {
      // Intenta verificar el token
      const isValid = await verifyToken(token);

      if (isValid) {
        setAccessToken(token);
      } else if (refreshToken) {
        // Si el token no es válido, intenta renovarlo
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            localStorage.setItem('spotify_access_token', newToken);
            setAccessToken(newToken);
          } else {
            console.error('Failed to refresh access token');
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }
    } else if (refreshToken) {
      // No hay token, pero hay refresh token: renueva directamente
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          localStorage.setItem('spotify_access_token', newToken);
          setAccessToken(newToken);
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }

    setLoading(false);
  };

  useEffect(() => { checkAndRefreshToken(); });

  useEffect(() => {
    if (accessToken) {
      getSpotifyUserData(accessToken, setAccessToken, setUserData);
      getFollowedArtists(accessToken, setFollowedArtists);
    }
  }, [accessToken]);

  if (loading) {
    return (<div> <p>Cargando...</p> </div>);
  }

  if (!accessToken) {
    return (
      <div className='login'>
        <h1 className='login__title'>Trackify</h1>
        <a href={getSpotifyAuthUrl()} className='login__link'>
          <button className='login__button'>
            <img src={spotifyLogo} alt='Spotify Logo' className='login__logo' />
            Iniciar sesión con Spotify
          </button>
        </a>
      </div>
    );
  }

  return (
    <div className='home'>
      {userData ?
        (
          <>
            <div className='profile'>
              <h1 className='profile__title'>
                Bienvenido a Trackify, {userData.display_name}!
              </h1>
              <a href={userData.external_urls.spotify}>
                <img
                  src={userData.images[0]?.url}
                  alt='Imagen de perfil'
                  width={100}
                  className='profile__image'
                />
              </a>
            </div>
            <SearchArtists
              accessToken={accessToken}
              followedArtists={followedArtists}
              setFollowedArtists={setFollowedArtists}
              searching={searching}
              setSearching={setSearching}
            />
            {!searching && (
              <FollowedArtists
                accessToken={accessToken}
                artists={followedArtists}
              />
            )
            }
          </>
        ) : (<p>Cargando datos...</p>)
      }
    </div>
  );
};

export default HomePage;
