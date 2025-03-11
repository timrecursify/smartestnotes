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
        // Log all available window properties to debug WebApp detection
        console.log('Window properties:', Object.keys(window));
        
        // More lenient check for Telegram WebApp - some clients may load it differently
        const isTelegramWebApp = 
          (window.Telegram && window.Telegram.WebApp) || 
          window.TelegramWebApp || 
          window.sessionStorage.getItem('telegramWebAppData');
        
        // Handle non-Telegram WebApp environment with fallback
        if (!isTelegramWebApp) {
          console.log('Not detected in Telegram WebApp environment, checking URL parameters');
          
          // Try to get auth data from URL parameters as fallback
          const urlParams = new URLSearchParams(window.location.search);
          const tgAuthData = urlParams.get('tgAuthData');
          
          if (tgAuthData) {
            // Process URL-based auth data
            try {
              const decodedData = JSON.parse(atob(tgAuthData));
              console.log('Found auth data in URL:', decodedData);
              
              // Use the auth data directly
              setStatus('Processing auth data from URL...');
              const success = await loginWithTelegram(decodedData);
              
              if (success) {
                setStatus('Login successful, redirecting...');
                const noteId = urlParams.get('note');
                if (noteId) {
                  navigate(`/notes/${noteId}`, { replace: true });
                } else {
                  navigate('/notes', { replace: true });
                }
                return;
              } else {
                setStatus('Authentication failed');
                // Continue with standard flow after a delay
                setTimeout(() => {
                  navigate('/login', { replace: true });
                }, 2000);
                return;
              }
            } catch (e) {
              console.error('Error processing URL auth data:', e);
            }
          }
          
          // Auto-redirect to login after a short delay
          setStatus('Not opened from Telegram, redirecting to login...');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
          return;
        }

        // Get Telegram WebApp object, whichever way it's available
        const webApp = window.Telegram?.WebApp || window.TelegramWebApp;
        
        if (webApp) {
          // Standard WebApp flow
          console.log('Telegram WebApp detected:', webApp);
          
          try {
            webApp.ready();
            // Enable closing confirmation only if the method exists
            if (typeof webApp.enableClosingConfirmation === 'function') {
              webApp.enableClosingConfirmation();
            }
          } catch (e) {
            console.warn('Error calling WebApp methods:', e);
            // Continue anyway
          }
          
          setStatus('WebApp initialized');
          
          // Get user data from WebApp
          const webAppUser = webApp.initDataUnsafe?.user;
          
          if (webAppUser) {
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
              tg_init_data: webApp.initData || ''
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
              setStatus('Authentication failed, redirecting to login...');
              setTimeout(() => {
                navigate('/login', { replace: true });
              }, 2000);
            }
          } else {
            // No user data in WebApp
            setStatus('No user data found, using authentication fallback...');
            
            // Try to create minimal auth data from initData
            if (webApp.initData) {
              const minimalAuthData = {
                tg_webapp: true,
                tg_init_data: webApp.initData,
                tg_auth_date: Math.floor(Date.now() / 1000).toString(),
                tg_hash: 'webapp'
              };
              
              const success = await loginWithTelegram(minimalAuthData);
              
              if (success) {
                setStatus('Login successful, redirecting...');
                navigate('/notes', { replace: true });
              } else {
                setStatus('Authentication failed, redirecting to login...');
                setTimeout(() => {
                  navigate('/login', { replace: true });
                }, 2000);
              }
            } else {
              // If all else fails, redirect to login
              setStatus('Could not authenticate automatically, redirecting to login...');
              setTimeout(() => {
                navigate('/login', { replace: true });
              }, 2000);
            }
          }
        } else {
          // WebApp object not found
          setStatus('Telegram WebApp not initialized properly, redirecting to login...');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
        }
      } catch (error) {
        console.error('Telegram WebApp auth error:', error);
        setStatus(`Error: ${error.message}`);
        
        // Redirect to login after error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    performTelegramAuth();
  }, [loginWithTelegram, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center p-6 max-w-sm mx-auto">
        <div className="mb-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
        <h2 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">
          Authenticating with Telegram
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {status}
        </p>
      </div>
    </div>
  );
};

export default TelegramAuth;
