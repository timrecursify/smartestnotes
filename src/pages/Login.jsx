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
    // Check for Telegram WebApp integration
    const checkTelegramWebApp = () => {
      // Check if we're running inside Telegram WebApp
      if (window.Telegram && window.Telegram.WebApp) {
        console.log('Running inside Telegram WebApp, auto-authenticating...');
        
        const webAppUser = window.Telegram.WebApp.initDataUnsafe?.user;
        if (webAppUser) {
          console.log('WebApp user data available:', webAppUser);
          
          // Convert Telegram WebApp user data to the format our API expects
          const authData = {
            tg_id: webAppUser.id.toString(),
            tg_first_name: webAppUser.first_name || '',
            tg_last_name: webAppUser.last_name || '',
            tg_username: webAppUser.username || '',
            tg_photo_url: webAppUser.photo_url || '',
            tg_auth_date: Math.floor(Date.now() / 1000).toString(),
            // We don't have a hash from WebApp, but our backend will validate based on the initData
            tg_hash: 'webapp',
            tg_webapp: true,
            // Include the entire initData for validation
            tg_init_data: window.Telegram.WebApp.initData
          };
          
          // Attempt login with Telegram WebApp data
          setIsLoading(true);
          setError(null);
          
          loginWithTelegram(authData)
            .then(success => {
              if (success) {
                navigate('/', { replace: true });
              } else {
                setError('Failed to automatically authenticate with Telegram WebApp');
              }
            })
            .catch(err => {
              console.error('Error during Telegram WebApp authentication:', err);
              setError('Error during automatic authentication');
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      }
    };

    checkTelegramWebApp();

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
    
    // Handle Telegram WebApp callback
    window.onTelegramAuth = (user) => {
      if (user) {
        // Convert WebApp user data to expected format
        const authData = {
          tg_id: user.id.toString(),
          tg_first_name: user.first_name,
          tg_username: user.username,
          tg_photo_url: user.photo_url,
          tg_auth_date: user.auth_date.toString(),
          tg_hash: user.hash
        };
        
        // Process login with Telegram data
        loginWithTelegram(authData)
          .then(success => {
            if (success) {
              navigate('/', { replace: true });
            } else {
              setError('Failed to authenticate with Telegram');
            }
          })
          .catch(err => {
            setError('An error occurred during authentication');
            console.error(err);
          });
      }
    };
    
    // Expose the callback function globally
    window.onTelegramAuth = window.onTelegramAuth || function() {};
    
    return () => {
      // Clean up
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [loginWithTelegram, navigate]);
  
  // Handle direct Telegram login via URL
  const handleTelegramLogin = () => {
    window.open('https://t.me/notes20bot?start=auth', '_blank');
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-8 max-w-md mx-auto px-4 py-8">
      <div className="text-center space-y-2 w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to Smartest Notes
        </h2>
        <p className="text-md text-gray-600 dark:text-gray-400">
          Sign in with your Telegram account to continue
        </p>
      </div>
      
      {/* Login card */}
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-6 space-y-6">
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-center">
            <p>{error}</p>
          </div>
        )}
        
        {/* Telegram login options */}
        {!isLoading && (
          <div className="space-y-6">
            {/* Telegram widget (script injects button here) */}
            <div id="telegram-login" className="flex justify-center min-h-[48px]"></div>
            
            {/* Divider */}
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
              <span className="flex-shrink mx-3 text-sm text-gray-500 dark:text-gray-400">or</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            
            {/* Manual Telegram button as fallback */}
            <div className="text-center">
              <button
                onClick={handleTelegramLogin}
                className="w-full inline-flex items-center justify-center px-5 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <RiTelegramLine className="mr-2 h-6 w-6" />
                Log in with Telegram
              </button>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                You'll be redirected to Telegram to authorize
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center">
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
