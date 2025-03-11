import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../common/Logo';
import { 
  RiDashboardLine, 
  RiFileList3Line, 
  RiSearchLine, 
  RiSettings4Line, 
  RiAddLine,
  RiCloseLine,
  RiStarLine,
  RiUser3Line
} from 'react-icons/ri';

/**
 * Application sidebar with navigation links
 * 
 * @param {Object} props Component props
 * @param {boolean} props.open Whether sidebar is open on mobile
 * @param {Function} props.setOpen Function to set sidebar open state
 */
const Sidebar = ({ open, setOpen }) => {
  const { user, logout } = useAuth();
  
  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-md transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <Logo />
        
        {/* Close button (mobile only) */}
        <button
          type="button"
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <RiCloseLine className="w-6 h-6" />
        </button>
      </div>
      
      {/* User info */}
      {user && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name || 'User'}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user.isPremium ? 'Premium' : 'Free'}
                </span>
                {user.isPremium && (
                  <RiStarLine className="ml-1 w-3 h-3 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation links */}
      <nav className="flex flex-col p-4">
        <div className="space-y-1">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
            end
          >
            <RiDashboardLine className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/notes" 
            className={({ isActive }) => 
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            <RiFileList3Line className="w-5 h-5" />
            <span>Notes</span>
          </NavLink>
          
          <NavLink 
            to="/create" 
            className={({ isActive }) => 
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            <RiAddLine className="w-5 h-5" />
            <span>Create Note</span>
          </NavLink>
          
          <NavLink 
            to="/search" 
            className={({ isActive }) => 
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            <RiSearchLine className="w-5 h-5" />
            <span>Search</span>
          </NavLink>
          
          <NavLink 
            to="/profile" 
            className={({ isActive }) => 
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            <RiUser3Line className="w-5 h-5" />
            <span>Profile</span>
          </NavLink>
          
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            <RiSettings4Line className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
        </div>
        
        {/* Logout button */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="w-full text-left nav-link text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            onClick={logout}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
