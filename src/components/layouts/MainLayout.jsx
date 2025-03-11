import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';
import Footer from '../common/Footer';
import Toast from '../common/Toast';

/**
 * Main application layout with sidebar, header, and content area
 * Used for authenticated pages
 */
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  
  // Toggle sidebar visibility
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  
  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    
    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} showToast={showToast} />
        
        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <Outlet context={{ showToast }} />
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
      
      {/* Toast notifications */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default MainLayout;
