import logo from '../../assets/svg/logo.svg';
import menuIcon from '../../assets/svg/menu.svg';
import UserMenu from '../UserMenu/UserMenu'
import './Header.css';

interface HeaderProps {
  sidebarOpen: boolean;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  toggleSidebar: () => void;
  handleLogout: () => void;
}

const Header = ({ sidebarOpen, showUserMenu, setShowUserMenu, toggleSidebar, handleLogout }: HeaderProps) => {
  return (
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
        
        <UserMenu
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          handleLogout={handleLogout}
        />

      </div>
    </div>
  );
};

export default Header;