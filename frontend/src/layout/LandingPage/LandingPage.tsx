import React from 'react';
import { getSpotifyAuthUrl } from '../../services/spotify/spotifyAuth';
import spotifyLogo from '../../assets/svg/spotify.svg';
import logo from '../../assets/svg/logo.svg';
import musicIcon from '../../assets/svg/music.svg';
import notificationIcon from '../../assets/svg/notification.svg';
import playlistIcon from '../../assets/svg/playlist.svg';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-logo">
          <img src={logo} alt="TrackWatch Logo" className="landing-logo__image" />
          <h1 className="landing-logo__title">
            <span className="landing-logo__title--green">Track</span>
            <span className="landing-logo__title--white">Watch</span>
          </h1>
        </div>
        <a href={getSpotifyAuthUrl()} className="login-button-small">
          <img src={spotifyLogo} alt="Spotify Logo" className="login-button-small__logo" />
          Sign In
        </a>
      </header>

      <main className="landing-main">
        <section className="hero">
          <div className="hero__content">
            <h1 className="hero__title">
              Never miss a <span className="hero__title--highlight">new release</span> again
            </h1>
            <p className="hero__description">
              Stay updated on the latest music releases from your favorite artists. TrackWatch connects with your Spotify account to automatically track your favorite artists, notify you of new releases and add their new releases to a playlist in your Spotify account.
            </p>
            <a href={getSpotifyAuthUrl()} className="login-button">
              <img src={spotifyLogo} alt="Spotify Logo" className="login-button__logo" />
              Sign In with Spotify
            </a>
          </div>
          <div className="hero__image-container">
            {/* Placeholder for a hero image */}
            <div className="hero__image-placeholder"></div>
          </div>
        </section>

        <section className="features">
          <div className="features__grid">
            <div className="feature-card">
              <div className="feature-card__icon">
                <img src={musicIcon} alt="Music icon" className="feature-card__icon-svg" />
              </div>
              <h3 className="feature-card__title">Track Your Artists</h3>
              <p className="feature-card__description">
                Add the artists you want to follow, and as soon as they make a new release, we'll add it to a playlist in your Spotify account.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">
                <img src={notificationIcon} alt="Notification icon" className="feature-card__icon-svg" />
              </div>
              <h3 className="feature-card__title">Release Notifications</h3>
              <p className="feature-card__description">
              Receive notifications when your favorite artists release new songs, albums, EPs or be featurings on songs by other artists.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">
                <img src={playlistIcon} alt="Playlist icon" className="feature-card__icon-svg" />
              </div>
              <h3 className="feature-card__title">
                Playlist Generator
                <span className="feature-card__tag">NEW</span>
              </h3>
              <p className="feature-card__description">
                Generate playlists with all the songs of any artist you want. Perfect for discovering the complete discography of your favorite artists.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p className="landing-footer__text">
          Made with ♥ by <a className='landing-footer__link' href="https://github.com/emlopezr">@emlopezr</a>
        </p>
        <p className="landing-footer__disclaimer">
          TrackWatch is not affiliated with Spotify
        </p>
      </footer>
    </div>
  );
};

export default LandingPage; 