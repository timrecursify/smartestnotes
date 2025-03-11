import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

/**
 * Telegram WebApp automatic authentication component
 * This component is specifically designed to handle direct WebApp authentication
 * from Telegram and immediately redirect to the appropriate page.
 */
const TelegramAuth = () => {
  const [status, setStatus] = useState('Initializing...');
  const [logs, setLogs] = useState([]);
  const { loginWithTelegram } = useAuth();
  const navigate = useNavigate();

  // Add a log entry with timestamp
  const addLog = (message) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setLogs(prev => [...prev, logEntry]);
  };

  useEffect(() => {
    const performTelegramAuth = async () => {
      try {
        addLog('Starting Telegram WebApp authentication');
        
        // Log user agent for debugging
        addLog(`User agent: ${navigator.userAgent}`);
        
        // More lenient check for Telegram WebApp - some clients may load it differently
        const isTelegramWebApp = !!(
          (window.Telegram && window.Telegram.WebApp) || 
          window.TelegramWebApp
        );
        
        addLog(`Telegram WebApp detected: ${isTelegramWebApp}`);
        
        // First check if we're in a Telegram WebApp environment
        if (isTelegramWebApp) {
          // Get WebApp object
          const webApp = window.Telegram?.WebApp || window.TelegramWebApp;
          
          if (webApp) {
            addLog('Accessing Telegram WebApp API');
            
            try {
              if (typeof webApp.ready === 'function') {
                webApp.ready();
                addLog('Called WebApp.ready()');
              }
              
              // Only call if the method exists
              if (typeof webApp.enableClosingConfirmation === 'function') {
                webApp.enableClosingConfirmation();
                addLog('Called WebApp.enableClosingConfirmation()');
              }
            } catch (e) {
              addLog(`WebApp method error: ${e.message}`);
            }
            
            // According to Telegram docs, we should use the initData for authentication
            if (webApp.initData) {
              addLog(`WebApp initData available (length: ${webApp.initData.length})`);
              
              // Prepare auth data with initData which contains all necessary auth info
              const authData = {
                tg_webapp: true,
                tg_init_data: webApp.initData,
                // Add minimal user data as fallback
                tg_id: webApp.initDataUnsafe?.user?.id?.toString() || '',
                tg_first_name: webApp.initDataUnsafe?.user?.first_name || '',
                tg_username: webApp.initDataUnsafe?.user?.username || ''
              };
              
              setStatus('Authenticating with Telegram WebApp...');
              addLog(`Sending WebApp auth data with initData`);
              
              // Attempt login with WebApp data
              const success = await loginWithTelegram(authData);
              
              if (success) {
                addLog('Authentication successful with WebApp data');
                setStatus('Login successful, redirecting...');
                
                // Redirect to the appropriate page
                const urlParams = new URLSearchParams(window.location.search);
                const noteId = urlParams.get('note');
                
                if (noteId) {
                  navigate(`/notes/${noteId}`, { replace: true });
                } else {
                  navigate('/notes', { replace: true });
                }
                return;
              } else {
                addLog('Authentication failed with WebApp data');
              }
            } else {
              addLog('No initData available in WebApp object');
            }
          } else {
            addLog('Telegram WebApp object not found');
          }
        }
        
        // Try to get auth data from URL parameters as fallback
        const urlParams = new URLSearchParams(window.location.search);
        const tgAuthData = urlParams.get('tgAuthData');
        
        if (tgAuthData) {
          addLog('Found tgAuthData in URL parameters');
          try {
            // Directly use URL parameters for authentication
            const decodedData = JSON.parse(atob(tgAuthData));
            addLog(`Decoded auth data: ${JSON.stringify(decodedData)}`);
            
            // Add webapp flag to ensure backend processes it correctly
            decodedData.tg_webapp = true;
            
            // Attempt login with URL parameters
            setStatus('Authenticating with URL parameters...');
            const success = await loginWithTelegram(decodedData);
            
            if (success) {
              addLog('Authentication successful with URL parameters');
              setStatus('Login successful, redirecting...');
              const noteId = urlParams.get('note');
              
              if (noteId) {
                navigate(`/notes/${noteId}`, { replace: true });
              } else {
                navigate('/notes', { replace: true });
              }
              return;
            } else {
              addLog('Authentication failed with URL parameters');
            }
          } catch (e) {
            addLog(`Error processing URL auth data: ${e.message}`);
          }
        }
        
        // If we reached here, all authentication methods failed
        addLog('All authentication methods failed, redirecting to login page');
        setStatus('Authentication failed, redirecting to login...');
        
        // Show the failure for a moment before redirecting
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
        
      } catch (error) {
        const errorMsg = `Error: ${error.message}`;
        addLog(errorMsg);
        setStatus(errorMsg);
        
        // Redirect to login after error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    performTelegramAuth();
  }, [loginWithTelegram, navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
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
        
        {/* Debug logs - will help us diagnose any issues */}
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left max-h-80 overflow-y-auto text-xs">
          <h3 className="font-bold mb-2 text-gray-700 dark:text-gray-300">Debug Logs:</h3>
          {logs.length > 0 ? (
            <ul className="space-y-1">
              {logs.map((log, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-400 break-all">{log}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No logs yet...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TelegramAuth;
