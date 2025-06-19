import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/common/Navigation';
import Homepage from './components/pages/Homepage';
import GraduateDashboard from './components/dashboard/GraduateDashboard';
import InvestorPortal from './components/investor/InvestorPortal';
import AdminPanel from './components/admin/AdminPanel';
import AuthModal from './components/auth/AuthModal';
import Footer from './components/common/Footer';
import './styles/index.css';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.userType === 'graduate') {
        setCurrentPage('graduate-dashboard');
      } else if (user.userType === 'investor') {
        setCurrentPage('investor-portal');
      } else if (user.userType === 'admin') {
        setCurrentPage('admin-panel');
      }
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'graduate-dashboard':
        return <GraduateDashboard />;
      case 'investor-portal':
        return <InvestorPortal />;
      case 'admin-panel':
        return <AdminPanel />;
      default:
        return <Homepage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        setAuthModal={setAuthModal}
      />
      {renderPage()}
      
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
        onSwitchMode={(mode) => setAuthModal({ isOpen: true, mode })}
      />

      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
