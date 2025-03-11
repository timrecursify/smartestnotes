import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RiTelegramLine } from 'react-icons/ri';

/**
 * Login page component
 * Handles Telegram authentication
 */
const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loginWithTelegram } = useAuth();
  const navigate = useNavigate();
  
  // Set up Telegram widget on component mount
  useEffect(() => {
    // Create Telegram login script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'notes20bot'); // Your bot username
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-auth-url', window.location.origin + '/login/callback');
    script.async = true;
    
    // Append script to container
    const container = document.getElementById('telegram-login');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }
    
    // Handle auth callback for Telegram login
    const handleTelegramCallback = async () => {
      // Get auth data from URL query params
      const urlParams = new URLSearchParams(window.location.search);
      const authData = {};
      
      // Extract Telegram auth data from URL
      for (const [key, value] of urlParams.entries()) {
        if (key.startsWith('tg_')) {
          authData[key] = value;
        }
      }
      
      // If we have auth data, process login
      if (Object.keys(authData).length > 0) {
        try {
          setIsLoading(true);
          setError(null);
          
          // Attempt login with Telegram data
          const success = await loginWithTelegram(authData);
          
          if (success) {
            navigate('/', { replace: true });
          } else {
            setError('Failed to authenticate with Telegram');
          }
        } catch (err) {
          setError('An error occurred during authentication');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    // Check for Telegram auth data in URL
    if (window.location.search.includes('tg_')) {
      handleTelegramCallback();
    }
    
    return () => {
      // Clean up
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [loginWithTelegram, navigate]);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
          Use your Telegram account to sign in
        </p>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {/* Telegram login button */}
      {!isLoading && (
        <div className="space-y-6">
          <div id="telegram-login" className="flex justify-center"></div>
          
          {/* Manual Telegram button as fallback */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Or login with your Telegram account using this link
            </p>
            <a
              href="https://t.me/notes20bot?start=auth"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RiTelegramLine className="mr-2 h-5 w-5" />
              Login with Telegram
            </a>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
