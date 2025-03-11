import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import api, { endpoints } from '../services/api';
import { 
  RiSave3Line, 
  RiUser3Line, 
  RiPaletteLine, 
  RiLockLine, 
  RiNotificationLine,
  RiTelegramLine
} from 'react-icons/ri';

/**
 * Settings page component
 * Allows users to manage their preferences and account settings
 */
const Settings = () => {
  const { showToast } = useOutletContext() || {};
  const { user, updateUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  
  // User preferences state
  const [preferences, setPreferences] = useState({
    name: '',
    email: '',
    notifications: {
      email: false,
      push: false,
      telegram: true,
    },
    autoEnrichEnabled: true,
    language: 'en',
  });
  
  // Set initial preferences from user data
  useEffect(() => {
    if (user) {
      setPreferences(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        notifications: user.preferences?.notifications || prev.notifications,
        autoEnrichEnabled: user.preferences?.autoEnrichEnabled ?? prev.autoEnrichEnabled,
        language: user.preferences?.language || prev.language,
      }));
    }
  }, [user]);
  
  // Update user preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put(endpoints.user.preferences, data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser({ preferences: data });
      showToast?.('Settings updated successfully', 'success');
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      showToast?.('Failed to update settings', 'error');
    },
  });
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const preferencesData = {
      notifications: preferences.notifications,
      autoEnrichEnabled: preferences.autoEnrichEnabled,
      language: preferences.language,
    };
    
    // Include name and email only if they changed
    if (preferences.name !== user?.name) {
      preferencesData.name = preferences.name;
    }
    
    if (preferences.email !== user?.email) {
      preferencesData.email = preferences.email;
    }
    
    updatePreferencesMutation.mutate(preferencesData);
  };
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notifications.')) {
      const notificationType = name.split('.')[1];
      setPreferences(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationType]: checked,
        },
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <RiUser3Line className="mr-2 h-5 w-5" />
                Profile Information
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={preferences.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={preferences.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="sm:col-span-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <RiTelegramLine className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Connected to Telegram
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Your account is linked to your Telegram profile
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Appearance section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <RiPaletteLine className="mr-2 h-5 w-5" />
                Appearance
              </h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <button
                    type="button"
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200 dark:bg-gray-700"
                    role="switch"
                    aria-checked={darkMode}
                    onClick={toggleDarkMode}
                  >
                    <span className="sr-only">Toggle dark mode</span>
                    <span
                      className={`${
                        darkMode ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    >
                      <span
                        className={`${
                          darkMode
                            ? 'opacity-0 duration-100 ease-out'
                            : 'opacity-100 duration-200 ease-in'
                        } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                        aria-hidden="true"
                      >
                        <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" />
                        </svg>
                      </span>
                      <span
                        className={`${
                          darkMode
                            ? 'opacity-100 duration-200 ease-in'
                            : 'opacity-0 duration-100 ease-out'
                        } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                        aria-hidden="true"
                      >
                        <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                        </svg>
                      </span>
                    </span>
                  </button>
                  <span className="ml-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Dark mode</span>
                  </span>
                </div>
                
                <div>
                  <label htmlFor="language" className="form-label">
                    Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    className="form-input"
                    value={preferences.language}
                    onChange={handleChange}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Notifications section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <RiNotificationLine className="mr-2 h-5 w-5" />
                Notifications
              </h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="notifications.email"
                      name="notifications.email"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={preferences.notifications.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notifications.email" className="font-medium text-gray-700 dark:text-gray-300">
                      Email notifications
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">
                      Receive email notifications about your notes and account.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="notifications.push"
                      name="notifications.push"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={preferences.notifications.push}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notifications.push" className="font-medium text-gray-700 dark:text-gray-300">
                      Push notifications
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">
                      Receive browser push notifications when using the web app.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="notifications.telegram"
                      name="notifications.telegram"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={preferences.notifications.telegram}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notifications.telegram" className="font-medium text-gray-700 dark:text-gray-300">
                      Telegram notifications
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">
                      Receive notifications through the Telegram bot.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI features section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
                  <circle cx="7.5" cy="14.5" r=".5"></circle>
                  <circle cx="16.5" cy="14.5" r=".5"></circle>
                </svg>
                AI Features
              </h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="autoEnrichEnabled"
                      name="autoEnrichEnabled"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={preferences.autoEnrichEnabled}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="autoEnrichEnabled" className="font-medium text-gray-700 dark:text-gray-300">
                      Auto-enrich notes
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">
                      Automatically process new notes with AI to add summaries, tags, and insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Security section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <RiLockLine className="mr-2 h-5 w-5" />
                Security
              </h2>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active Sessions
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      You're currently signed in on this device.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    onClick={() => {
                      if (confirm('Are you sure you want to log out from all devices? You will need to log in again.')) {
                        logout();
                      }
                    }}
                  >
                    Sign out everywhere
                  </button>
                </div>
              </div>
            </div>
            
            {/* Form actions */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary"
                disabled={updatePreferencesMutation.isLoading}
              >
                {updatePreferencesMutation.isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <RiSave3Line className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
