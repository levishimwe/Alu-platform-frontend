import React, { useState } from 'react';
import { User, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navigation = ({ currentPage, setCurrentPage, setAuthModal }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 
                className="text-2xl font-bold text-blue-600 cursor-pointer"
                onClick={() => handlePageChange('home')}
              >
                ALU Platform
              </h1>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <button 
                onClick={() => handlePageChange('home')}
                className={`px-3 py-2 text-sm font-medium ${
                  currentPage === 'home' ? 'text-blue-600' : 'text-gray-900 hover:text-blue-600'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => handlePageChange('investor-portal')}
                className={`px-3 py-2 text-sm font-medium ${
                  currentPage === 'investor-portal' ? 'text-blue-600' : 'text-gray-900 hover:text-blue-600'
                }`}
              >
                Projects
              </button>
              {user && (
                <button 
                  onClick={() => handlePageChange(user.userType === 'graduate' ? 'graduate-dashboard' : 'investor-portal')}
                  className={`px-3 py-2 text-sm font-medium ${
                    currentPage.includes('dashboard') ? 'text-blue-600' : 'text-gray-900 hover:text-blue-600'
                  }`}
                >
                  Dashboard
                </button>
              )}
              <a href="#help" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">Help</a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <img 
                    src={user.profileImage || '/api/placeholder/32/32'} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                  className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </button>
              </div>
            )}
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
              <button 
                onClick={() => handlePageChange('home')}
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 w-full text-left"
              >
                Home
              </button>
              <button 
                onClick={() => handlePageChange('investor-portal')}
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 w-full text-left"
              >
                Projects
              </button>
              {user && (
                <button 
                  onClick={() => handlePageChange(user.userType === 'graduate' ? 'graduate-dashboard' : 'investor-portal')}
                  className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 w-full text-left"
                >
                  Dashboard
                </button>
              )}
              <a href="#help" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600">Help</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
