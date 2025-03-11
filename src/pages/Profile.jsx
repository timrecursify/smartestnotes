import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import api, { endpoints } from '../services/api';
import { RiUser3Line, RiEdit2Line, RiTelegramLine, RiCalendarLine, RiMailLine } from 'react-icons/ri';

/**
 * Profile page component
 * Displays user profile information and stats
 */
const Profile = () => {
  const { showToast } = useOutletContext() || {};
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    email: '',
  });
  
  // Fetch user profile details
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get(endpoints.user.profile);
      return response.data;
    },
    onSuccess: (data) => {
      setProfileData({
        name: data.name || '',
        bio: data.bio || '',
        email: data.email || '',
      });
    }
  });
  
  // Fetch user stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const response = await api.get(endpoints.user.stats);
      return response.data;
    }
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put(endpoints.user.updateProfile, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['userProfile']);
      updateUser({ name: data.name, email: data.email });
      setIsEditing(false);
      showToast?.('Profile updated successfully', 'success');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      showToast?.('Failed to update profile', 'error');
    },
  });
  
  // Reset form when cancelling edit
  const handleCancelEdit = () => {
    setProfileData({
      name: profile?.name || '',
      bio: profile?.bio || '',
      email: profile?.email || '',
    });
    setIsEditing(false);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };
  
  // Calculate join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Show loading state
  if (profileLoading && statsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        My Profile
      </h1>
      
      {/* Profile card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="form-label">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows="3"
                  className="form-input"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us a bit about yourself"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={updateProfileMutation.isLoading}
                >
                  {updateProfileMutation.isLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <RiUser3Line className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {profile?.name || 'User'}
                    </h2>
                    
                    <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-4">
                      {profile?.email && (
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <RiMailLine className="mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          {profile.email}
                        </div>
                      )}
                      
                      {profile?.telegramUsername && (
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <RiTelegramLine className="mr-1.5 h-4 w-4 text-blue-500" />
                          @{profile.telegramUsername}
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <RiCalendarLine className="mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        Joined {formatJoinDate(profile?.createdAt)}
                      </div>
                    </div>
                    
                    {profile?.bio && (
                      <p className="mt-3 text-gray-700 dark:text-gray-300">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditing(true)}
                >
                  <RiEdit2Line className="mr-2 h-4 w-4" />
                  Edit
                </button>
              </div>
              
              {profileError && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-md">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Error loading profile: {profileError.message || 'Please try again'}
                  </p>
                  <button
                    className="mt-1 text-xs text-red-600 dark:text-red-400 underline"
                    onClick={() => refetchProfile()}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Total Notes
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {statsLoading ? '...' : (stats?.totalNotes || 0).toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Notes created in your account
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            AI Enriched
          </h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {statsLoading ? '...' : (stats?.enrichedNotes || 0).toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Notes enhanced with AI
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            This Month
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {statsLoading ? '...' : (stats?.notesThisMonth || 0).toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Notes created this month
          </p>
        </div>
      </div>
      
      {/* Activity section */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-800 dark:text-blue-300">
                        {activity.type.charAt(0)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
