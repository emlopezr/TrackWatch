import { Link } from '../../routing/Router';
import { getSpotifyAuthUrl } from '../../services/spotify/spotifyAuth';
import { HIDE_PUBLIC_LOGIN } from '../../common/constants';
import FeatureCard from '../../layout/FeatureCard/FeatureCard';
import HeroExample from '../../layout/HeroExample/HeroExample';
import trackWatchlogo from '../../assets/svg/logo.svg';
import spotifyLogo from '../../assets/svg/spotify.svg';
import shieldIcon from '../../assets/svg/shield.svg';
import musicIcon from '../../assets/svg/music.svg';
import notificationIcon from '../../assets/svg/notification.svg';
import playlistIcon from '../../assets/svg/playlist.svg';
import ghostIcon from '../../assets/svg/ghost.svg';
import downloadIcon from '../../assets/svg/download.svg';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <a href="/" className='landing-logo__link'>
          <div className="landing-logo">
            <img src={trackWatchlogo} alt="TrackWatch Logo" className="landing-logo__image" />
            <h1 className="landing-logo__title">
              <span className="landing-logo__title--green">Track</span>
              <span className="landing-logo__title--white">Watch</span>
            </h1>
          </div>
        </a>
        {!HIDE_PUBLIC_LOGIN && (
          <a href={getSpotifyAuthUrl()} className="login-button-small">
            <img src={spotifyLogo} alt="Spotify Logo" className="login-button-small__logo" />
            Sign In
          </a>
        )}
      </header>

      <main className="landing-main">
        <section className="hero">
          <div className="hero__content">
            <h1 className="hero__title">
              Your Personal <span className="hero__title--highlight">Spotify Release</span> Tracker
            </h1>
            <p className="hero__description">
              Open source, self-hosted, and private. Automatically track your favorite artists and sync new releases to your playlist, completely under your control.
            </p>
            <div className="hero__buttons">
              {!HIDE_PUBLIC_LOGIN && (
                <a href={getSpotifyAuthUrl()} className="login-button">
                  <img src={spotifyLogo} alt="Spotify Logo" className="login-button__logo" />
                  Login with Spotify
                </a>
              )}
              <Link to="/install" className={HIDE_PUBLIC_LOGIN ? "install-button install-button--primary" : "install-button"}>
                <img src={downloadIcon} alt="Download Icon" className="install-button__icon icon-white" />
                How to Install
              </Link>
            </div>
          </div>
          <div className="hero__image-container">
            <HeroExample />
          </div>
        </section>

        <section className="features">
          <div className="features__grid">
            <FeatureCard
              icon={shieldIcon}
              title="Your Data, Your Server"
              description="No third-party tracking. Your Spotify tokens and listening history never leave your own infrastructure. Runs entirely in your Docker container."
            />
            <FeatureCard
              icon={musicIcon}
              title="Automated Tracking"
              description="Add the artists you want to follow, and as soon as they make a new release, your instance automatically adds it to your playlist."
            />
            <FeatureCard
              icon={notificationIcon}
              title="Release Notifications"
              description="Receive notifications when your favorite artists release new songs, albums, or EPs."
            />
            <FeatureCard
              icon={playlistIcon}
              title="Discography Generator"
              description="Generate a complete playlist with every track from your favorite artist. Search for an artist and create your personalized collection instantly."
            />
            <FeatureCard
              icon={ghostIcon}
              title="Ghost Tracks Cleaner"
              description="Find and remove unplayable (greyed out) tracks from your playlists to keep your library clean."
            />
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p className="landing-footer__text">
          Made with ♥ by <a className='landing-footer__link' href="https://github.com/emlopezr">@emlopezr</a>
        </p>
        <div className="landing-footer__legals_container">
          <p className="landing-footer__links">
            <a className="landing-footer__link" href="/eula" target="_blank" rel="noopener noreferrer">Terms of Use</a> · {" "}
            <a className="landing-footer__link" href="/privacy" target="_blank" rel="noopener noreferrer">Data Handling</a> · {" "}
            <a className="landing-footer__link" href="https://github.com/emlopezr/trackwatch" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
          <p className="landing-footer__disclaimer">
            <span className="landing-footer__disclaimer-text">TrackWatch is not affiliated with Spotify</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
