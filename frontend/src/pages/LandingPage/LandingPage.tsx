import React from 'react';
import { getSpotifyAuthUrl } from '../../services/spotify/spotifyAuth';
import FeatureCard from '../../layout/FeatureCard/FeatureCard';
import HeroExample from '../../layout/HeroExample/HeroExample';
import logo from '../../assets/svg/logo.svg';
import spotifyLogo from '../../assets/svg/spotify.svg';
import musicIcon from '../../assets/svg/music.svg';
import notificationIcon from '../../assets/svg/notification.svg';
import playlistIcon from '../../assets/svg/playlist.svg';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <a href="/" className='landing-logo__link'>
          <div className="landing-logo">
            <img src={logo} alt="TrackWatch Logo" className="landing-logo__image" />
            <h1 className="landing-logo__title">
              <span className="landing-logo__title--green">Track</span>
              <span className="landing-logo__title--white">Watch</span>
            </h1>
          </div>
        </a>
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
            <HeroExample />
          </div>
        </section>

        <section className="features">
          <div className="features__grid">
            <FeatureCard
              icon={musicIcon}
              title="Track Your Artists"
              description="Add the artists you want to follow, and as soon as they make a new release, we'll add it to a playlist in your Spotify account."
            />
            <FeatureCard
              icon={notificationIcon}
              title="Release Notifications"
              description="Receive notifications when your favorite artists release new songs, albums, EPs, or be featured in songs by other artists."
            />
            <FeatureCard
              icon={playlistIcon}
              title="Playlist Generator"
              description="Generate playlists with all the songs of any artist you want. Perfect for discovering the complete discography of your favorite artists."
              tag="New"
            />
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