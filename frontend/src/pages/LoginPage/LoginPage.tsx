import { getSpotifyAuthUrl } from '../../services/spotify/spotifyAuth';
import trackWatchlogo from '../../assets/svg/logo.svg';
import spotifyLogo from '../../assets/svg/spotify.svg';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-page__container">
        <div className="login-page__logo">
          <img src={trackWatchlogo} alt="TrackWatch Logo" className="login-page__logo-image" />
          <h1 className="login-page__title">
            <span className="login-page__title--green">Track</span>
            <span className="login-page__title--white">Watch</span>
          </h1>
        </div>
        <p className="login-page__description">
          Sign in to your TrackWatch instance
        </p>
        <a href={getSpotifyAuthUrl()} className="login-page__button">
          <img src={spotifyLogo} alt="Spotify Logo" className="login-page__button-logo" />
          Login with Spotify
        </a>
      </div>
    </div>
  );
};

export default LoginPage;
