import { useEffect, useState, useRef } from 'react';
import { useUser } from '../../context/useUser';
import { refreshAccessToken, verifyToken } from '../../services/spotify/spotifyToken';
import { getTrackWatchUserData } from '../../services/trackwatch/trackwatchUsers';
import SpotifyArtistResponse from '../../types/spotify/SpotifyArtistResponse';
import LandingPage from '../../layout/LandingPage/LandingPage';
import Spinner from '../../components/Spinner/Spinner';
import logo from '../../assets/svg/logo.svg';
import homeFilled from '../../assets/svg/home-filled.svg';
import homeOutline from '../../assets/svg/home-outline.svg';
import menuIcon from '../../assets/svg/menu.svg';
import playlistIcon from '../../assets/svg/playlist.svg';
import coffeeIcon from '../../assets/svg/coffee.svg';
import closeIcon from '../../assets/svg/delete.svg';
import logoutIcon from '../../assets/svg/logout.svg';
import './MainPage.css';
import HomePage from '../../layout/HomePage/HomePage';

type PageType = 'home' | 'generator';

const MainPage = () => {
  const { userData, setUserData } = useUser();

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [artistsData, setArtistsData] = useState<SpotifyArtistResponse[]>([]);

  const [activePage, setActivePage] = useState<PageType>('home');

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768); // Open by default on desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const checkAndRefreshToken = async () => {
    const token = localStorage.getItem('spotify_access_token');
    const refreshToken = localStorage.getItem('spotify_refresh_token');

    if (token) {
      const isValid = await verifyToken(token);

      if (isValid) {
        setAccessToken(token);
      } else if (refreshToken) {
        // If the token is not valid, try to renew it.
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            localStorage.setItem('spotify_access_token', newToken);
            setAccessToken(newToken);
          }
        } catch {
          console.error('Error refreshing token');
        }
      }
    } else if (refreshToken) {
      // No access token, but there is refresh token: renew directly
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          localStorage.setItem('spotify_access_token', newToken);
          setAccessToken(newToken);
        }
      } catch {
        console.error('Error refreshing token');
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    checkAndRefreshToken();

    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Open by default on desktop, closed on mobile
      setSidebarOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (accessToken && !userData) {
      getTrackWatchUserData(setAccessToken, setUserData);
    }
  }, [accessToken, setUserData, userData]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');

    setAccessToken(null);
    setUserData(null);

    window.location.href = '/';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (page: PageType) => {
    setActivePage(page);
    if (isMobile) setSidebarOpen(false);
  };

  const renderPageContent = () => {
    switch (activePage) {
      case 'home':
        return <HomePage
          accessToken={accessToken}
          searching={searching}
          artistsData={artistsData}
          setArtistsData={setArtistsData}
          setSearching={setSearching}
        />
      case 'generator':
        return null;
      default:
        return null;
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!accessToken) {
    return <LandingPage />;
  }

  if (!userData) {
    return <Spinner />;
  }

  return (
    <div className={`home ${sidebarOpen ? 'with-sidebar' : ''}`}>
      <div
        ref={sidebarRef}
        className={`sidebar ${!sidebarOpen ? 'sidebar-hidden' : 'sidebar-visible'}`}
      >
        {/* Desktop Burger Menu */}
        <img
          src={menuIcon}
          alt="Toggle menu"
          className={`menu-icon sidebar__burger-menu icon-white ${sidebarOpen ? 'open' : ''}`}
          onClick={toggleSidebar}
        />

        {/* Mobile Close Button */}
        <img
          src={closeIcon}
          alt="Close menu"
          className={`menu-icon sidebar__mobile-close icon-white ${sidebarOpen ? 'open' : ''}`}
          onClick={toggleSidebar}
        />

        <nav className="sidebar__nav">
          {/* Home Link */}
          <a
            href="#home"
            className={`sidebar__link ${activePage === 'home' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange('home');
            }}
          >
            <img
              src={activePage === 'home' ? homeFilled : homeOutline}
              alt="Home"
              className="sidebar__link-icon icon-white"
            />
            Home
          </a>

          {/* Generator Link */}
          <a
            href="#generator"
            className={`sidebar__link ${activePage === 'generator' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange('generator');
            }}
          >
            <img
              src={playlistIcon}
              alt="Generator"
              className="sidebar__link-icon icon-white"
            />
            Generator
          </a>

          {/* Ko-fi Link */}
          <a
            href="https://ko-fi.com/emlopezr"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar__link kofi-link"
          >
            <div className="kofi-button">
              <img
                src={coffeeIcon}
                alt="Ko-Fi"
                className="sidebar__link-icon icon-white"
              />
              Buy me a coffee {"<3"}
            </div>
          </a>
        </nav>
      </div>

      {/* Dark overlay for mobile when sidebar is open */}
      <div
        className={`overlay ${isMobile && sidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
      ></div>

      <div className="header">
        <div className='profile'>
          <div className="menu-icon-wrapper">
            <img
              src={menuIcon}
              alt="Toggle menu"
              className={`menu-icon icon-white ${sidebarOpen ? 'open' : ''}`}
              onClick={toggleSidebar}
            />
          </div>
          <div className="profile__title">
            <img src={logo} alt="Logo" className="profile__logo" />
            <h1>
              <span className="profile__title--green">Track</span>
              <span className="profile__title--white">Watch</span>
            </h1>
          </div>
          <div className="profile__user-container" ref={userMenuRef}>
            <div
              className="profile__image-container"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <img
                src={userData.imageUrl}
                alt='Profile image'
                width={100}
                className='profile__image'
              />
            </div>

            {showUserMenu && (
              <div className="profile__menu">
                <p className="profile__menu-name">{userData.name}</p>
                <button
                  className="profile__menu-logout"
                  onClick={handleLogout}
                >
                  <img src={logoutIcon} alt="Log Out" className='icon-white' />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="app-layout">
        <div className="main-content">
          <div className="page-content">
            {renderPageContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
