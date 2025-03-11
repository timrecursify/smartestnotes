import { Link } from 'react-router-dom';

/**
 * Logo component for the application
 * 
 * @param {Object} props Component props
 * @param {string} props.size Size of the logo (small, medium, large)
 * @param {boolean} props.linkToHome Whether to wrap the logo in a Link to home
 */
const Logo = ({ size = 'medium', linkToHome = true }) => {
  const sizeClasses = {
    small: 'h-6',
    medium: 'h-8',
    large: 'h-12',
  };
  
  const logoContent = (
    <div className="flex items-center">
      <div className={`${sizeClasses[size]} aspect-square rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center`}>
        <span className="text-white font-bold text-xl">N</span>
      </div>
      <span className="ml-2 font-bold text-gray-900 dark:text-white">
        Notes 2.0
      </span>
    </div>
  );
  
  if (linkToHome) {
    return (
      <Link to="/" className="flex items-center">
        {logoContent}
      </Link>
    );
  }
  
  return logoContent;
};

export default Logo;
