import { useEffect, useState } from 'react';
import { useUser } from '../../context/useUser';
import { getSpotifyAuthUrl } from '../../services/spotify/spotifyAuth';
import { refreshAccessToken, verifyToken } from '../../services/spotify/spotifyToken';
import { getTrackifyUserData } from '../../services/trackify/trackifyUser';
import FollowedArtists from '../../components/FollowedArtists/FollowedArtists';
import spotifyLogo from '../../assets/svg/spotify.svg';
import './HomePage.css';
// import { TrackifyArtist } from '../../types/trackify/TrackifyArtist';
import SearchBar from '../../components/SearchBar/SearchBar';
import SearchResults from '../../components/SearchResults/SearchResults';
import { SpotifyArtistResponse } from '../../types/spotify/SpotifyArtistResponse';

const HomePage = () => {
  const { userData, setUserData } = useUser();

  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [searching, setSearching] = useState(false)
  const [artistsData, setArtistsData] = useState<SpotifyArtistResponse[]>([]);

  // Función para verificar y renovar el token si es necesario
  const checkAndRefreshToken = async () => {
    const token = localStorage.getItem('spotify_access_token');
    const refreshToken = localStorage.getItem('spotify_refresh_token');

    if (token) {
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
    if (accessToken && !userData) {
      getTrackifyUserData(setAccessToken, setUserData);
    }
  }, [accessToken, setUserData, userData]);

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
            <div className="header">
              <div className='profile'>
                <h1 className='profile__title'>
                  Bienvenido a Trackify, {userData.name}!
                </h1>
                <a href="/">
                  <img
                    src={userData.images[0]?.url}
                    alt='Imagen de perfil'
                    width={100}
                    className='profile__image'
                  />
                </a>
              </div>
              <SearchBar
                accessToken={accessToken}
                setArtistsData={setArtistsData}
                setSearching={setSearching}
              />
            </div>

            {searching && <SearchResults artistsData={artistsData} />}

            {!searching && (
              <FollowedArtists
                accessToken={accessToken}
                followedArtists={userData.followedArtists}
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
