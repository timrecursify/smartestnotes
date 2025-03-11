import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '../services/api';
import { RiSearchLine, RiFileList3Line, RiCalendarLine, RiTimeLine } from 'react-icons/ri';

/**
 * Search page component
 * Advanced search functionality for notes
 */
const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useState({
    query: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'relevance',
    limit: 20
  });
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => ({
      ...prev,
      query: searchTerm.trim()
    }));
  };
  
  // Perform search query
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['search', searchParams],
    queryFn: async () => {
      // Only search if there's a query
      if (!searchParams.query) {
        return { notes: [], total: 0 };
      }
      
      const response = await api.get(endpoints.notes.search, {
        params: searchParams
      });
      return response.data;
    },
    enabled: Boolean(searchParams.query),
    keepPreviousData: true
  });
  
  // Handle date filter changes
  const handleDateChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle sort change
  const handleSortChange = (sortBy) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy
    }));
  };
  
  // Highlight search terms in text
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={index} className="bg-yellow-200 dark:bg-yellow-900">{part}</mark>
        : part
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          Search Notes
        </h1>
      </div>
      
      {/* Search form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="searchTerm" className="form-label">
              Search Term
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <RiSearchLine className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="searchTerm"
                className="form-input pl-10"
                placeholder="Search for keywords, phrases, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                required
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-3 flex items-center bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dateFrom" className="form-label flex items-center">
                <RiCalendarLine className="mr-1" />
                From Date
              </label>
              <input
                type="date"
                id="dateFrom"
                className="form-input"
                value={searchParams.dateFrom}
                onChange={(e) => handleDateChange('dateFrom', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="dateTo" className="form-label flex items-center">
                <RiCalendarLine className="mr-1" />
                To Date
              </label>
              <input
                type="date"
                id="dateTo"
                className="form-input"
                value={searchParams.dateTo}
                onChange={(e) => handleDateChange('dateTo', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="sortBy" className="form-label flex items-center">
                <RiTimeLine className="mr-1" />
                Sort By
              </label>
              <select
                id="sortBy"
                className="form-input"
                value={searchParams.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="updatedAt:desc">Last Updated</option>
                <option value="createdAt:desc">Recently Created</option>
                <option value="title:asc">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </form>
      </div>
      
      {/* Search results */}
      {searchParams.query && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search Results
              {data && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({data.total} {data.total === 1 ? 'note' : 'notes'} found)
                </span>
              )}
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <p className="text-red-700 dark:text-red-300">Search error: {error.message || 'Failed to perform search'}</p>
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
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                  <RiFileList3Line className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No notes found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <>
                {data.notes.map((note) => (
                  <Link 
                    key={note.id} 
                    to={`/notes/${note.id}`}
                    className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {highlightText(note.title || 'Untitled Note', searchParams.query)}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                          {note.isEnriched && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              AI
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {highlightText(note.content, searchParams.query)}
                      </p>
                      
                      {/* Matches info */}
                      {note.matches && note.matches.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Matches: </span>
                          {note.matches.map((match, idx) => (
                            <span key={idx} className="mr-2">
                              {match.field}: {match.count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
                
                {/* Load more button */}
                {data.hasMore && (
                  <div className="p-4 text-center">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setSearchParams(prev => ({ 
                        ...prev, 
                        limit: prev.limit + 10
                      }))}
                    >
                      Load More Results
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
