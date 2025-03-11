import { useEffect } from 'react';
import {
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiCloseLine
} from 'react-icons/ri';

/**
 * Toast notification component
 * 
 * @param {Object} props Component props
 * @param {boolean} props.show Whether to show the toast
 * @param {string} props.message Toast message
 * @param {string} props.type Toast type (success, error, warning, info)
 * @param {Function} props.onClose Function to close the toast
 */
const Toast = ({ show, message, type = 'info', onClose }) => {
  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  
  if (!show) return null;
  
  // Define type-specific styles and icons
  const typeStyles = {
    success: 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    error: 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  };
  
  const typeIcons = {
    success: <RiCheckboxCircleLine className="w-5 h-5 text-green-500 dark:text-green-400" />,
    error: <RiErrorWarningLine className="w-5 h-5 text-red-500 dark:text-red-400" />,
    warning: <RiErrorWarningLine className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />,
    info: <RiInformationLine className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full sm:w-auto">
      <div className={`rounded-md shadow-lg overflow-hidden ${typeStyles[type] || typeStyles.info}`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {typeIcons[type] || typeIcons.info}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium">
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="inline-flex text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
