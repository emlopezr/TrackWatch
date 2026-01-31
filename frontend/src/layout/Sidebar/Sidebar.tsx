import menuIcon from '../../assets/svg/menu.svg';
import homeFilled from '../../assets/svg/home-filled.svg';
import homeOutline from '../../assets/svg/home-outline.svg';
import playlistIcon from '../../assets/svg/playlist.svg';
import musicIcon from '../../assets/svg/music.svg';
import coffeeIcon from '../../assets/svg/coffee.svg';
import closeIcon from '../../assets/svg/delete.svg';
import './Sidebar.css';

type PageType = 'home' | 'generator' | 'ghost-tracks';

interface SidebarProps {
  activePage: PageType;
  sidebarOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  handlePageChange: (page: PageType) => void;
}

const Sidebar = ({ activePage, sidebarOpen, isMobile, toggleSidebar, handlePageChange }: SidebarProps) => {
  return (
    <>
      <div className={`sidebar ${!sidebarOpen ? 'sidebar-hidden' : 'sidebar-visible'}`}>
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

          {/* Ghost Tracks Cleaner Link */}
          <a
            href="#ghost-tracks"
            className={`sidebar__link ${activePage === 'ghost-tracks' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange('ghost-tracks');
            }}
          >
            <img
              src={musicIcon}
              alt="Ghost Tracks Cleaner"
              className="sidebar__link-icon icon-white"
            />
            Ghost Tracks Cleaner
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
      {isMobile && (
        <div
          className={`overlay ${isMobile && sidebarOpen ? 'active' : ''}`}
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;