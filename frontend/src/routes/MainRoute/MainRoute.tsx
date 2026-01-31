import { useEffect, useState, useRef } from 'react';
import { useUser } from '../../context/useUser';
import { useTokenManager } from '../../hooks/useTokenManager';
import { getTrackWatchUserData } from '../../services/trackwatch/trackwatchUsers';
import SpotifyArtistResponse from '../../types/spotify/SpotifyArtistResponse';
import LandingPage from '../../pages/LandingPage/LandingPage';
import Spinner from '../../components/Spinner/Spinner';
import HomePage from '../../pages/HomePage/HomePage';
import GeneratorPage from '../../pages/GeneratorPage/GeneratorPage';
import GhostTracksPage from '../../pages/GhostTracksPage/GhostTracksPage';
import Sidebar from '../../layout/Sidebar/Sidebar';
import Header from '../../layout/Header/Header';
import './MainRoute.css';

type PageType = 'home' | 'generator' | 'ghost-tracks';

const MainRoute = () => {
  const { userData, setUserData } = useUser();
  const { loading, accessToken, setAccessToken } = useTokenManager();

  const [searching, setSearching] = useState(false)
  const [artistsData, setArtistsData] = useState<SpotifyArtistResponse[]>([]);
  const [activePage, setActivePage] = useState<PageType>('home');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768); // Open by default on desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
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
        />;
      case 'generator':
        return <GeneratorPage />;
      case 'ghost-tracks':
        return <GhostTracksPage />;
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
      <Sidebar 
        activePage={activePage}
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
        handlePageChange={handlePageChange}
      />

      <Header
        sidebarOpen={sidebarOpen}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        toggleSidebar={toggleSidebar}
        handleLogout={handleLogout}
      />

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

export default MainRoute;
