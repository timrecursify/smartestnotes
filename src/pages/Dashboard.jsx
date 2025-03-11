import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import api, { endpoints } from '../services/api';
import { RiFileAddLine, RiFileList3Line, RiSearchLine } from 'react-icons/ri';

/**
 * Dashboard page component
 * Shows recent notes, stats, and quick actions
 */
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalNotes: 0,
    recentNotes: [],
    enrichedCount: 0
  });

  // Fetch recent notes
  const { data: notesData, isLoading, error } = useQuery({
    queryKey: ['recentNotes'],
    queryFn: async () => {
      const response = await api.get(endpoints.notes.list, {
        params: { limit: 5, sort: 'updatedAt:desc' }
      });
      return response.data;
    }
  });

  // Update stats when data is loaded
  useEffect(() => {
    if (notesData) {
      setStats(prev => ({
        ...prev,
        totalNotes: notesData.total || 0,
        recentNotes: notesData.notes || [],
        enrichedCount: notesData.notes?.filter(note => note.isEnriched).length || 0
      }));
    }
  }, [notesData]);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Your AI-powered note-taking assistant is ready to help.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <RiFileList3Line className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notes</h2>
              {isLoading ? (
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalNotes}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Enriched</h2>
              {isLoading ? (
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.enrichedCount}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</h2>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/create"
            className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <RiFileAddLine className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="ml-3 font-medium text-blue-700 dark:text-blue-300">Create Note</span>
          </Link>

          <Link
            to="/notes"
            className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
          >
            <RiFileList3Line className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span className="ml-3 font-medium text-purple-700 dark:text-purple-300">View All Notes</span>
          </Link>

          <Link
            to="/search"
            className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RiSearchLine className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">Search Notes</span>
          </Link>
        </div>
      </div>

      {/* Recent notes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Notes</h2>
          <Link
            to="/notes"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
            <p className="text-red-700 dark:text-red-300">Failed to load recent notes</p>
          </div>
        ) : stats.recentNotes.length === 0 ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">No notes yet. Create your first note!</p>
            <Link
              to="/create"
              className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <RiFileAddLine className="mr-2 h-4 w-4" />
              Create Note
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentNotes.map((note) => (
              <Link
                key={note.id}
                to={`/notes/${note.id}`}
                className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{note.title}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {note.content}
                </p>
                {note.isEnriched && (
                  <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    AI Enriched
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
