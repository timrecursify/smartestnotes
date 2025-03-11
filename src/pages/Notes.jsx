import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import api, { endpoints } from '../services/api';
import { RiFileAddLine, RiSearchLine, RiFilterLine, RiSortAsc, RiSortDesc } from 'react-icons/ri';

/**
 * Notes page component
 * Displays the list of all notes with filtering and sorting options
 */
const Notes = () => {
  const { showToast } = useOutletContext() || {};
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Fetch notes with query params
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notes', filter, sortField, sortDirection, currentPage, pageSize],
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: pageSize,
        sort: `${sortField}:${sortDirection}`,
      };
      
      if (filter) {
        params.search = filter;
      }
      
      const response = await api.get(endpoints.notes.list, { params });
      return response.data;
    }
  });
  
  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);
  
  // Handle sorting change
  const handleSortChange = (field) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Handle note deletion
  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(endpoints.notes.delete(noteId));
      showToast?.('Note deleted successfully', 'success');
      refetch();
    } catch (error) {
      console.error('Error deleting note:', error);
      showToast?.('Failed to delete the note', 'error');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          My Notes
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/search"
            className="btn-secondary flex items-center justify-center"
          >
            <RiSearchLine className="mr-2 h-4 w-4" />
            Advanced Search
          </Link>
          <Link
            to="/create"
            className="btn-primary flex items-center justify-center"
          >
            <RiFileAddLine className="mr-2 h-4 w-4" />
            Create Note
          </Link>
        </div>
      </div>
      
      {/* Filters and sorting */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search filter */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <RiSearchLine className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Filter notes..."
                className="form-input pl-10"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
          
          {/* Sort dropdown */}
          <div className="w-full sm:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <RiFilterLine className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="form-input pl-10 appearance-none"
                value={`${sortField}:${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split(':');
                  setSortField(field);
                  setSortDirection(direction);
                }}
              >
                <option value="updatedAt:desc">Last Updated</option>
                <option value="updatedAt:asc">Oldest First</option>
                <option value="createdAt:desc">Recently Created</option>
                <option value="createdAt:asc">First Created</option>
                <option value="title:asc">Title A-Z</option>
                <option value="title:desc">Title Z-A</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {sortDirection === 'asc' ? (
                  <RiSortAsc className="h-5 w-5 text-gray-400" />
                ) : (
                  <RiSortDesc className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notes list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <p className="text-red-700 dark:text-red-300">Failed to load notes</p>
              <button
                type="button"
                className="mt-2 text-sm text-red-700 dark:text-red-300 underline"
                onClick={() => refetch()}
              >
                Try again
              </button>
            </div>
          </div>
        ) : data?.notes?.length === 0 ? (
          <div className="p-6">
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filter ? 'No notes match your search criteria.' : 'No notes yet. Create your first note!'}
              </p>
              <Link
                to="/create"
                className="btn-primary"
              >
                <RiFileAddLine className="mr-2 h-4 w-4" />
                Create Note
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSortChange('title')}>
                      <div className="flex items-center">
                        <span>Title</span>
                        {sortField === 'title' && (
                          <span className="ml-2">
                            {sortDirection === 'asc' ? (
                              <RiSortAsc className="h-4 w-4" />
                            ) : (
                              <RiSortDesc className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSortChange('updatedAt')}>
                      <div className="flex items-center">
                        <span>Last Updated</span>
                        {sortField === 'updatedAt' && (
                          <span className="ml-2">
                            {sortDirection === 'asc' ? (
                              <RiSortAsc className="h-4 w-4" />
                            ) : (
                              <RiSortDesc className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSortChange('createdAt')}>
                      <div className="flex items-center">
                        <span>Created</span>
                        {sortField === 'createdAt' && (
                          <span className="ml-2">
                            {sortDirection === 'asc' ? (
                              <RiSortAsc className="h-4 w-4" />
                            ) : (
                              <RiSortDesc className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {data?.notes?.map((note) => (
                    <tr key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/notes/${note.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          <div className="flex items-center">
                            <span className="font-medium">{note.title || 'Untitled Note'}</span>
                            {note.isEnriched && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                AI
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1 max-w-md">
                            {note.content}
                          </p>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(note.updatedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(note.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/notes/${note.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {data?.totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, data?.total || 0)}
                      </span>{' '}
                      of <span className="font-medium">{data?.total || 0}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        type="button"
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {[...Array(data?.totalPages || 0)].map((_, index) => {
                        const pageNumber = index + 1;
                        // Show current page, first, last, and pages around current
                        if (
                          pageNumber === 1 ||
                          pageNumber === data?.totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              type="button"
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNumber === currentPage
                                  ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        }
                        
                        // Show dots for page gaps
                        if (
                          (pageNumber === 2 && currentPage > 3) ||
                          (pageNumber === data?.totalPages - 1 && currentPage < data?.totalPages - 2)
                        ) {
                          return (
                            <span
                              key={pageNumber}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              ...
                            </span>
                          );
                        }
                        
                        return null;
                      })}
                      
                      <button
                        type="button"
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        disabled={currentPage === data?.totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, data?.totalPages || 1))}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notes;
