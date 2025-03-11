import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '../services/api';
import ReactMarkdown from 'react-markdown';
import {
  RiArrowLeftLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSave3Line,
  RiCloseLine,
  RiMagicLine,
} from 'react-icons/ri';

/**
 * Note detail page component
 * Displays a single note with options to view, edit, and delete
 */
const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useOutletContext() || {};
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);
  
  // Fetch note data
  const {
    data: note,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      const response = await api.get(endpoints.notes.detail(id));
      return response.data;
    },
  });
  
  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async (noteData) => {
      const response = await api.put(endpoints.notes.update(id), noteData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['note', id]);
      queryClient.invalidateQueries(['notes']);
      setIsEditing(false);
      showToast?.('Note updated successfully', 'success');
    },
    onError: (error) => {
      console.error('Error updating note:', error);
      showToast?.('Failed to update the note', 'error');
    },
  });
  
  // Enrich note mutation
  const enrichNoteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(endpoints.notes.enrich(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['note', id]);
      queryClient.invalidateQueries(['notes']);
      showToast?.('Note enriched successfully', 'success');
      setIsEnriching(false);
    },
    onError: (error) => {
      console.error('Error enriching note:', error);
      showToast?.('Failed to enrich the note', 'error');
      setIsEnriching(false);
    },
  });
  
  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(endpoints.notes.delete(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      navigate('/notes');
      showToast?.('Note deleted successfully', 'success');
    },
    onError: (error) => {
      console.error('Error deleting note:', error);
      showToast?.('Failed to delete the note', 'error');
    },
  });
  
  // Set form values when note data is loaded
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    }
  }, [note]);
  
  // Handle save button click
  const handleSave = () => {
    updateNoteMutation.mutate({
      title: title.trim() || 'Untitled Note',
      content,
    });
  };
  
  // Handle delete button click
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deleteNoteMutation.mutate();
    }
  };
  
  // Handle enrich button click
  const handleEnrich = () => {
    setIsEnriching(true);
    enrichNoteMutation.mutate();
  };
  
  // Cancel editing
  const handleCancel = () => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setIsEditing(false);
  };
  
  // Handle back button click
  const handleBack = () => {
    navigate('/notes');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/30 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error Loading Note</h2>
        <p className="text-red-600 dark:text-red-400 mb-4">Failed to load the note. It may have been deleted or you don't have permission to view it.</p>
        <button
          type="button"
          className="btn-secondary mr-2"
          onClick={handleBack}
        >
          <RiArrowLeftLine className="mr-2 h-4 w-4" />
          Back to Notes
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={refetch}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={handleBack}
        >
          <RiArrowLeftLine className="mr-2 h-4 w-4" />
          Back to Notes
        </button>
        
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
              >
                <RiCloseLine className="mr-2 h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={updateNoteMutation.isLoading}
              >
                {updateNoteMutation.isLoading ? (
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
                    Save
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditing(true)}
              >
                <RiEditLine className="mr-2 h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleEnrich}
                disabled={isEnriching}
              >
                {isEnriching ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enriching...
                  </span>
                ) : (
                  <>
                    <RiMagicLine className="mr-2 h-4 w-4" />
                    Enrich with AI
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
              >
                <RiDeleteBinLine className="mr-2 h-4 w-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Note content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {isEditing ? (
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                id="title"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title"
              />
            </div>
            <div>
              <label htmlFor="content" className="form-label">
                Content
              </label>
              <textarea
                id="content"
                className="form-input min-h-[300px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note content here... Markdown is supported"
              />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Markdown formatting is supported.</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {note?.title || 'Untitled Note'}
              {note?.isEnriched && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  AI Enriched
                </span>
              )}
            </h1>
            
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
              <div>
                Created: {new Date(note?.createdAt).toLocaleString()}
              </div>
              <div>
                Updated: {new Date(note?.updatedAt).toLocaleString()}
              </div>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{note?.content || ''}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteDetail;
