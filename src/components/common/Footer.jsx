import { Link } from 'react-router-dom';

/**
 * Footer component for the application
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-4 px-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <div className="mb-2 sm:mb-0">
          <p>&copy; {currentYear} Notes 2.0. All rights reserved.</p>
        </div>
        
        <div className="flex space-x-4">
          <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">
            Terms
          </Link>
          <a 
            href="https://t.me/notes20bot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            Telegram Bot
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
