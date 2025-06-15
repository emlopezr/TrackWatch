import { useRef, useEffect } from 'react';
import { useUser } from '../../context/useUser';
import logoutIcon from '../../assets/svg/logout.svg';
import './UserMenu.css'

interface UserMenuProps {
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  handleLogout: () => void;
}

const UserMenu = ({ showUserMenu, setShowUserMenu, handleLogout }: UserMenuProps) => {
  const { userData } = useUser();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [setShowUserMenu]);

  if (!userData) {
    return
  }

  return (
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
          <a className="profile__menu-link" href="/eula" target="_blank" rel="noopener noreferrer">Terms of Use</a>
          <a className="profile__menu-link" href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <button className="profile__menu-logout" onClick={handleLogout} >
            <img src={logoutIcon} alt="Log Out" className='icon-white' />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;