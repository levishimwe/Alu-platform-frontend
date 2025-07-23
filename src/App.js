import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navigation from "./components/common/Navigation";
import Homepage from "./components/pages/Homepage";
import GraduateDashboard from "./components/dashboard/GraduateDashboard";
import InvestorPortal from "./components/investor/InvestorPortal";
import AdminPanel from "./components/admin/AdminPanel";
import AuthModal from "./components/auth/AuthModal";
import Footer from "./components/common/Footer";
import ProjectForm from "./components/projects/ProjectForm";
import GraduateProfile from './components/profile/GraduateProfile';
import InvestorProfile from './components/profile/InvestorProfile';
import MessageCenter from './components/messaging/MessageCenter';
import ContactModal from './components/messaging/ContactModal';
import "./styles/index.css";

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: "login" });
  const [editingProject, setEditingProject] = useState(null);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (user) {
      
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


  useEffect(() => {
    const handleAuthTrigger = (e) => {
      if (e.target.hasAttribute('data-auth-trigger')) {
        e.preventDefault();
        if (!user) {
          setAuthModal({ isOpen: true, mode: 'login' });
        } else {
          setCurrentPage('investor-portal');
        }
      }
    };

    document.addEventListener('click', handleAuthTrigger);
    return () => document.removeEventListener('click', handleAuthTrigger);
  }, [user]);
const handlePageNavigation = (targetPage) => {
    // ✅ UPDATED: Added messages and profile to protected pages
    const protectedPages = [
      'graduate-dashboard', 
      'investor-portal', 
      'admin-panel', 
      'graduates', 
      'create-project', 
      'edit-project',
      'graduate-profile',
      'investor-profile',
      'messages',
      'profile'
    ];
    
    if (protectedPages.includes(targetPage) && !user) {
      setAuthModal({ isOpen: true, mode: 'login' });
      return;
    }
    
    setCurrentPage(targetPage);
  };
const handleProjectSubmit = async (projectData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingProject 
        ? `http://localhost:5000/api/projects/${editingProject.id}`
        : 'http://localhost:5000/api/projects';
      
      const method = editingProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        setEditingProject(null);
        setCurrentPage('graduate-dashboard');
      } else {
        const error = await response.json();
        console.error('Project submission failed:', error);

      }
    } catch (error) {
      console.error('Project submission error:', error);

    }
  };

  const handleProjectCancel = () => {
    setEditingProject(null);
    setCurrentPage('graduate-dashboard');
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setCurrentPage('edit-project');
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
        return (
          <GraduateDashboard 
            onCreateProject={() => setCurrentPage('create-project')}
            onEditProject={handleEditProject}
          />
        );

      case "graduate-profile":
        if (!user || user.userType !== "graduate") {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-4">You need to be logged in as a graduate to access your profile.</p>
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
        return <GraduateProfile />;

      case "investor-profile":
        if (!user || user.userType !== "investor") {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-4">You need to be logged in as an investor to access your profile.</p>
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
        return <InvestorProfile />;

      // ✅ NEW: Unified profile route
      case "profile":
        if (!user) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
                <p className="text-gray-600 mb-4">Please log in to access your profile.</p>
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
        
        // Automatically render the correct profile based on user type
        if (user.userType === 'graduate') {
          return <GraduateProfile />;
        } else if (user.userType === 'investor') {
          return <InvestorProfile />;
        } else {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Profile Not Available</h2>
                <p className="text-gray-600 mb-4">Profile not available for your user type.</p>
              </div>
            </div>
          );
        }
        
      case "create-project":
        if (!user || user.userType !== "graduate") {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-4">You need to be logged in as a graduate to create projects.</p>
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
          <div className="min-h-screen bg-gray-50 py-8">
            <ProjectForm
              onSubmit={handleProjectSubmit}
              onCancel={handleProjectCancel}
              initialData={null}
            />
          </div>
        );

      case "edit-project":
        if (!user || user.userType !== "graduate") {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-4">You need to be logged in as a graduate to edit projects.</p>
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
          <div className="min-h-screen bg-gray-50 py-8">
            <ProjectForm
              onSubmit={handleProjectSubmit}
              onCancel={handleProjectCancel}
              initialData={editingProject}
            />
          </div>
        );
        
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

      case "messages":
        if (!user) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
                <p className="text-gray-600 mb-4">Please log in to access messages.</p>
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
        return <MessageCenter />;

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
