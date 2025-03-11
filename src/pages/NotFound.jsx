import { Link } from 'react-router-dom';
import { RiArrowLeftLine, RiHome2Line } from 'react-icons/ri';

/**
 * Not Found page component
 * Displayed when a user navigates to a non-existent route
 */
const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-16">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
        
        <div className="mt-6 mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="btn-primary flex items-center justify-center"
          >
            <RiHome2Line className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary flex items-center justify-center"
          >
            <RiArrowLeftLine className="mr-2 h-5 w-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
