import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { RiMenuLine, RiSunLine, RiMoonLine, RiBellLine } from 'react-icons/ri';

/**
 * Application header with menu toggle and user actions
 * 
 * @param {Object} props Component props
 * @param {Function} props.onMenuClick Function to toggle sidebar
 * @param {Function} props.showToast Function to show toast notifications
 */
const Header = ({ onMenuClick, showToast }) => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Menu button (mobile only) */}
        <button
          type="button"
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <RiMenuLine className="w-6 h-6" />
        </button>
        
        {/* Page title - will be dynamic in the future */}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
          Notes 2.0
        </h1>
        
        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            type="button"
            className="btn-icon"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <RiSunLine className="w-5 h-5" />
            ) : (
              <RiMoonLine className="w-5 h-5" />
            )}
          </button>
          
          {/* Notifications */}
          <button
            type="button"
            className="btn-icon relative"
            onClick={() => showToast('Notifications feature coming soon', 'info')}
            aria-label="Notifications"
          >
            <RiBellLine className="w-5 h-5" />
            {/* Notification indicator */}
            {user?.unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
          
          {/* User menu - simplified for now */}
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
