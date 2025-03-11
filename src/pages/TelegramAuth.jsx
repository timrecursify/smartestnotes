import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Telegram WebApp automatic authentication component
 * This component is specifically designed to handle direct WebApp authentication
 * from Telegram and immediately redirect to the appropriate page.
 */
const TelegramAuth = () => {
  const [status, setStatus] = useState('Initializing...');
  const { loginWithTelegram } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performTelegramAuth = async () => {
      try {
        // Check if we're in a Telegram WebApp
        if (!window.Telegram || !window.Telegram.WebApp) {
          console.error('Not in Telegram WebApp environment');
          setStatus('Error: Not opened from Telegram');
          return;
        }

        // Initialize the WebApp
        const webApp = window.Telegram.WebApp;
        webApp.ready();
        webApp.enableClosingConfirmation();

        console.log('Telegram WebApp initialized', webApp);
        setStatus('WebApp initialized');

        // Get user data from WebApp
        const webAppUser = webApp.initDataUnsafe?.user;
        if (!webAppUser) {
          console.error('No user data in WebApp');
          setStatus('Error: Could not get user data');
          return;
        }

        console.log('WebApp user data:', webAppUser);
        setStatus('User data received');

        // Prepare auth data
        const authData = {
          tg_id: webAppUser.id.toString(),
          tg_first_name: webAppUser.first_name || '',
          tg_last_name: webAppUser.last_name || '',
          tg_username: webAppUser.username || '',
          tg_photo_url: webAppUser.photo_url || '',
          tg_auth_date: Math.floor(Date.now() / 1000).toString(),
          tg_hash: 'webapp',  // Special webapp token
          tg_webapp: true,
          tg_init_data: webApp.initData
        };

        // Attempt login
        setStatus('Logging in...');
        const success = await loginWithTelegram(authData);

        if (success) {
          setStatus('Login successful, redirecting...');
          
          // Check for note ID in URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const noteId = urlParams.get('note');
          
          // Redirect to appropriate page
          if (noteId) {
            navigate(`/notes/${noteId}`, { replace: true });
          } else {
            navigate('/notes', { replace: true });
          }
        } else {
          setStatus('Authentication failed');
        }
      } catch (error) {
        console.error('Telegram WebApp auth error:', error);
        setStatus(`Error: ${error.message}`);
      }
    };

    performTelegramAuth();
  }, [loginWithTelegram, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
        <h2 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">
          Authenticating with Telegram
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {status}
        </p>
      </div>
    </div>
  );
};

export default TelegramAuth;
