import { useRef, useEffect, useState } from 'react';
import { useUser } from '../../context/useUser';
import logoutIcon from '../../assets/svg/logout.svg';
import settingsIcon from '../../assets/svg/settings.svg';
import './UserMenu.css'
import SettingsModal from '../../components/SettingsModal/SettingsModal';
import { togglePlaylistUpdates } from '../../services/trackwatch/trackwatchUsers';

interface UserMenuProps {
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  handleLogout: () => void;
}

const UserMenu = ({ showUserMenu, setShowUserMenu, handleLogout }: UserMenuProps) => {
  const { userData, setUserData } = useUser();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
          <div className="profile__menu-links">
            <a className="profile__menu-link" href="/eula" target="_blank" rel="noopener noreferrer">Terms of Use</a>
            <a className="profile__menu-link" href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </div>
          <div className="profile__menu-buttons">
            <button className="profile__menu-button profile__menu-settings" onClick={() => { setShowUserMenu(false); setShowSettingsModal(true); }}>
              <img src={settingsIcon} alt="Settings" className='icon-white profile__menu-icon' />
              Settings
            </button>
            <button className="profile__menu-button profile__menu-logout" onClick={handleLogout} >
              <img src={logoutIcon} alt="Log Out" className='icon-white profile__menu-icon' />
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          currentValue={userData.settings.updatesEnabled}
          onSave={async (enabled: boolean) => {
            if (enabled === userData.settings.updatesEnabled) {
              // Nothing to change, keep modal open if no change
              return;
            }

            try {
              const result = await togglePlaylistUpdates(userData.id, enabled);
              setUserData({
                ...userData,
                settings: { ...userData.settings, updatesEnabled: result },
              });
            } catch (error) {
              console.error('Error updating playlist updates setting', error);
              throw error;
            }
          }}
        />
      )}
    </div>
  );
};

export default UserMenu;