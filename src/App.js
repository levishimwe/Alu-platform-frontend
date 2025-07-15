import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navigation from "./components/common/Navigation";
import Homepage from "./components/pages/Homepage";
import GraduateDashboard from "./components/dashboard/GraduateDashboard";
import InvestorPortal from "./components/investor/InvestorPortal";
import AdminPanel from "./components/admin/AdminPanel";
import AuthModal from "./components/auth/AuthModal";
import Footer from "./components/common/Footer";
import "./styles/index.css";

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: "login" });
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (user) {
      // Only auto-redirect on initial login, not every time user state changes
      if (currentPage === "home") {
        if (user.userType === "graduate") {
          setCurrentPage("graduate-dashboard");
        } else if (user.userType === "investor") {
          setCurrentPage("investor-portal");
        } else if (user.userType === "admin") {
          setCurrentPage("admin-panel");
        }
      }
    }
  }, [user]);

  // Add click listener for auth triggers
  useEffect(() => {
    const handleAuthTrigger = (e) => {
      if (e.target.hasAttribute('data-auth-trigger')) {
        e.preventDefault();
        if (!user) {
          setAuthModal({ isOpen: true, mode: 'login' });
        } else {
          setCurrentPage('investor-portal'); // Navigate to projects
        }
      }
    };

    document.addEventListener('click', handleAuthTrigger);
    return () => document.removeEventListener('click', handleAuthTrigger);
  }, [user]);

  // Authentication check for protected pages
  const handlePageNavigation = (targetPage) => {
    const protectedPages = ['graduate-dashboard', 'investor-portal', 'admin-panel', 'graduates'];
    
    if (protectedPages.includes(targetPage) && !user) {
      setAuthModal({ isOpen: true, mode: 'login' });
      return;
    }
    
    setCurrentPage(targetPage);
  };

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
      case "graduate-dashboard":
        if (!user || user.userType !== "graduate") {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-4">You need to be logged in as a graduate to access this page.</p>
                <button
                  onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Login
                </button>
              </div>
            </div>
          );
        }
        return <GraduateDashboard />;
        
      case "investor-portal":
        if (!user) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
                <p className="text-gray-600 mb-4">Please log in to view projects and investor portal.</p>
                <button
                  onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Login
                </button>
              </div>
            </div>
          );
        }
        return <InvestorPortal />;
        
      case "admin-panel":
        if (!user || user.userType !== "admin") {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Go Home
                </button>
              </div>
            </div>
          );
        }
        return <AdminPanel />;
        
      case "graduates":
        if (!user) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
                <p className="text-gray-600 mb-4">Please log in to view graduates page.</p>
                <button
                  onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Login
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">ALU Graduates</h1>
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Graduates Directory</h2>
                <p className="text-gray-600">This section is coming soon. Here you'll be able to browse and connect with ALU graduates.</p>
              </div>
            </div>
          </div>
        );
        
      default:
        return <Homepage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={handlePageNavigation}
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
