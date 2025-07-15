import React, { useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import { Search, Menu, X } from 'lucide-react';
const Navigation = ({ currentPage, setCurrentPage, setAuthModal }) => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleAuthRequiredClick = (targetPage) => {
    if (!user) {
      setAuthModal({ isOpen: true, mode: 'login' });
    } else {
      setCurrentPage(targetPage);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  return (
    <header className="bg-[#1e3a8a] text-white shadow-lg">
      {/* Main Navigation Bar */}
      <div className="bg-[#1e3a8a] border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button 
                onClick={() => setCurrentPage('home')}
                className="flex items-center space-x-2"
              >
                <div className="bg-white text-[#1e3a8a] px-3 py-1 rounded font-bold text-xl">
                  ALU
                </div>
                <span className="text-sm">
                  ALU<br />
                  GP
                </span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setCurrentPage('home')}
                className={`hover:text-blue-200 font-medium px-3 py-2 text-sm uppercase tracking-wide ${
                  currentPage === 'home' ? 'text-blue-200' : ''
                }`}
              >
                HOME PROJECTS
              </button>

              <button 
                onClick={() => handleAuthRequiredClick('investor-portal')}
                className={`hover:text-blue-200 font-medium px-3 py-2 text-sm uppercase tracking-wide ${
                  currentPage === 'investor-portal' ? 'text-blue-200' : ''
                }`}
              >
                ALU PROJECTS
              </button>

              <button 
                onClick={() => handleAuthRequiredClick('graduates')}
                className="hover:text-blue-200 font-medium px-3 py-2 text-sm uppercase tracking-wide"
              >
                GRADUATES
              </button>

              <button 
                onClick={() => handleAuthRequiredClick('investor-portal')}
                className={`hover:text-blue-200 font-medium px-3 py-2 text-sm uppercase tracking-wide ${
                  currentPage === 'investor-portal' ? 'text-blue-200' : ''
                }`}
              >
                INVESTORS
              </button>

              {/* Search Icon */}
              <button className="hover:text-blue-200 p-2">
                <Search size={20} />
              </button>
            </nav>

            {/* Login/Register or User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm">Hello, {user.firstName}</span>
                  <button
                    onClick={() => {
                      if (user.userType === 'graduate') {
                        setCurrentPage('graduate-dashboard');
                      } else if (user.userType === 'investor') {
                        setCurrentPage('investor-portal');
                      } else if (user.userType === 'admin') {
                        setCurrentPage('admin-panel');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
                  >
                    DASHBOARD
                  </button>
                  <button
                    onClick={handleLogout}
                    className="border border-white hover:bg-white hover:text-blue-600 px-4 py-2 rounded text-sm font-medium"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                  className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-sm font-bold uppercase tracking-wide"
                >
                  LOGIN/REGISTER
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-blue-200 p-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#1e3a8a] border-t border-blue-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                setCurrentPage('home');
                setIsMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded ${
                currentPage === 'home' ? 'bg-blue-700' : ''
              }`}
            >
              HOME PROJECTS
            </button>
            
            <button
              onClick={() => {
                handleAuthRequiredClick('investor-portal');
                setIsMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded ${
                currentPage === 'investor-portal' ? 'bg-blue-700' : ''
              }`}
            >
              ALU PROJECTS
            </button>
            
            <button
              onClick={() => {
                handleAuthRequiredClick('graduates');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded"
            >
              GRADUATES
            </button>
            
            <button
              onClick={() => {
                handleAuthRequiredClick('investor-portal');
                setIsMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded ${
                currentPage === 'investor-portal' ? 'bg-blue-700' : ''
              }`}
            >
              INVESTORS
            </button>
            
            <div className="border-t border-blue-700 pt-4 mt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-blue-200">
                    Hello, {user.firstName}
                  </div>
                  <button
                    onClick={() => {
                      if (user.userType === 'graduate') {
                        setCurrentPage('graduate-dashboard');
                      } else if (user.userType === 'investor') {
                        setCurrentPage('investor-portal');
                      } else if (user.userType === 'admin') {
                        setCurrentPage('admin-panel');
                      }
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded"
                  >
                    DASHBOARD
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm font-medium border border-white hover:bg-white hover:text-blue-600 rounded"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModal({ isOpen: true, mode: 'login' });
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-center px-3 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 rounded uppercase tracking-wide"
                >
                  LOGIN/REGISTER
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
