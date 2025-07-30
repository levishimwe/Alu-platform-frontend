import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, Clock, Linkedin, Youtube } from 'lucide-react';

export default function Footer({ setCurrentPage, setAuthModal }) {
  const { user } = useAuth();

  const handleAuthRequiredNavigation = (targetPage) => {
    if (!user) {
      // If not logged in, show auth modal
      if (setAuthModal) {
        setAuthModal({ isOpen: true, mode: 'login' });
      } else {
        alert('Please log in to access this feature.');
      }
    } else {
      // If logged in, navigate to the target page
      if (setCurrentPage) {
        setCurrentPage(targetPage);
      }
    }
  };

  const handleContactUs = () => {
    if (setCurrentPage) {
      setCurrentPage('contact');
    } else {
      alert(`Contact Information:\n\nName: Levis Ishimwe\nPhone: +250 784 106 595\nEmail: i.levis@alustudent.com`);
    }
  };

  return (
    <footer className="bg-[#011e41] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-white">ALU Platform</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering ALU graduates to showcase their innovative projects and connect with investors.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Mail size={16} className="mr-3 text-gray-400" />
                <span className="text-sm">i.levis@alustudent.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone size={16} className="mr-3 text-gray-400" />
                <span className="text-sm">+250 784 106 595</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock size={16} className="mr-3 text-gray-400" />
                <span className="text-sm">Mon – Fri, 9AM – 5PM CAT</span>
              </div>
            </div>
          </div>

          {/* For Graduates */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">For Graduates</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  className="text-gray-300 hover:text-white transition-colors text-sm text-left"
                  onClick={() => {
                    if (!user) {
                      handleAuthRequiredNavigation('graduate-dashboard');
                    } else if (user.userType === 'graduate') {
                      handleAuthRequiredNavigation('create-project');
                    } else {
                      alert('This feature is only available for graduates.');
                    }
                  }}
                >
                  Upload Projects
                </button>
              </li>
              <li>
                <button 
                  className="text-gray-300 hover:text-white transition-colors text-sm text-left"
                  onClick={() => {
                    if (!user) {
                      handleAuthRequiredNavigation('graduate-dashboard');
                    } else if (user.userType === 'graduate') {
                      handleAuthRequiredNavigation('graduate-dashboard');
                    } else if (user.userType === 'investor') {
                      handleAuthRequiredNavigation('investor-portal');
                    } else if (user.userType === 'admin') {
                      handleAuthRequiredNavigation('admin-dashboard');
                    }
                  }}
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  className="text-gray-300 hover:text-white transition-colors text-sm text-left"
                  onClick={() => {
                    if (!user) {
                      handleAuthRequiredNavigation('home');
                    } else {
                      alert('Resources page coming soon!');
                    }
                  }}
                >
                  Resources
                </button>
              </li>
            </ul>
          </div>

          {/* For Investors */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">For Investors</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  className="text-gray-300 hover:text-white transition-colors text-sm text-left"
                  onClick={() => handleAuthRequiredNavigation('investor-portal')}
                >
                  Browse Projects
                </button>
              </li>
              <li>
                <a 
                  href="https://www.linkedin.com/school/alueducation/posts/?feedView=all" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Connect
                </a>
              </li>
              <li>
                <button 
                  className="text-gray-300 hover:text-white transition-colors text-sm text-left"
                  onClick={() => {
                    if (!user) {
                      handleAuthRequiredNavigation('investor-portal');
                    } else {
                      alert('Success Stories page coming soon!');
                    }
                  }}
                >
                  Success Stories
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.alueducation.com/" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Help Center
                </a>
              </li>
              <li>
                <button 
                  className="text-gray-300 hover:text-white transition-colors text-sm text-left"
                  onClick={handleContactUs}
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button 
                  className="text-gray-300 hover:text-white transition-colors text-sm text-left"
                  onClick={() => {
                    alert('Privacy Policy page coming soon!');
                  }}
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2024 ALU Graduates Empowerment Platform. All rights reserved.
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="https://www.linkedin.com/in/ishimwe-levi-0279a7301/"
                className="text-gray-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="https://youtu.be/rJkgXxG4x6Y?si=g62OELSeJ0flICDK"
                className="text-gray-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
