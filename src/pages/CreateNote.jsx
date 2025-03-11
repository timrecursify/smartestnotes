import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '../services/api';
import { RiSave3Line, RiCloseLine } from 'react-icons/ri';

/**
 * Create Note page component
 * Form for creating a new note
 */
const CreateNote = () => {
  const navigate = useNavigate();
  const { showToast } = useOutletContext() || {};
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [autoEnrich, setAutoEnrich] = useState(false);
  
  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (noteData) => {
      const response = await api.post(endpoints.notes.create, noteData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['notes']);
      showToast?.('Note created successfully', 'success');
      navigate(`/notes/${data.id}`);
    },
    onError: (error) => {
      console.error('Error creating note:', error);
      showToast?.('Failed to create the note', 'error');
    },
  });
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      showToast?.('Please enter some content for your note', 'warning');
      return;
    }
    
    createNoteMutation.mutate({
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      autoEnrich,
    });
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    navigate('/notes');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Note
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
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
              placeholder="Note Title (optional)"
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
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoEnrich"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={autoEnrich}
              onChange={() => setAutoEnrich(!autoEnrich)}
            />
            <label htmlFor="autoEnrich" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Automatically enrich this note with AI
            </label>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Markdown formatting is supported.</p>
          </div>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-right space-x-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
          >
            <RiCloseLine className="mr-2 h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={createNoteMutation.isLoading || !content.trim()}
          >
            {createNoteMutation.isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              <>
                <RiSave3Line className="mr-2 h-4 w-4" />
                Create Note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNote;
